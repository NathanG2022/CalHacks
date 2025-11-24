"""
Main orchestrator for PromptBreaker attack against Letta RAG.
Coordinates attacker (prompt generation) with target (Letta agent queries).
"""

import json
import os
import time
import sqlite3
from datetime import datetime
from typing import List, Dict, Optional
import sys

# Add subdirectories to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'attacker'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'target_letta'))

from composer import PromptComposer, GeneticOptimizer
from run_query import LettaQueryRunner, QueryLogger


class AttackOrchestrator:
    """Orchestrates PromptBreaker attacks against Letta RAG agents"""

    def __init__(self, db_path: str = None):
        self.composer = PromptComposer()
        self.query_runner = LettaQueryRunner()
        self.logger = QueryLogger()

        if db_path is None:
            db_path = os.path.join(os.path.dirname(__file__), "data", "attacks.db")

        self.db_path = db_path
        self._init_database()

    def _init_database(self):
        """Initialize SQLite database for attack logging"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS experiments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                agent_id TEXT NOT NULL,
                poison_enabled BOOLEAN,
                hardened BOOLEAN,
                timestamp TEXT,
                total_queries INTEGER,
                canary_detections INTEGER,
                success_rate REAL
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS queries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                experiment_id INTEGER,
                prompt TEXT,
                response TEXT,
                canary_detected BOOLEAN,
                response_time REAL,
                timestamp TEXT,
                metadata TEXT,
                FOREIGN KEY (experiment_id) REFERENCES experiments (id)
            )
        """)

        conn.commit()
        conn.close()

    def run_attack_batch(
        self,
        agent_id: str,
        n_candidates: int = 50,
        experiment_name: str = "default",
        poison_enabled: bool = False,
        hardened: bool = False
    ) -> Dict:
        """
        Run a batch of attack prompts against a Letta agent

        Args:
            agent_id: Target Letta agent ID
            n_candidates: Number of attack prompts to generate
            experiment_name: Name for this experiment
            poison_enabled: Whether poison doc is in knowledge base
            hardened: Whether agent uses hardened system prompt

        Returns:
            Summary statistics
        """
        print(f"\n{'='*60}")
        print(f"EXPERIMENT: {experiment_name}")
        print(f"Agent: {agent_id}")
        print(f"Poison enabled: {poison_enabled}")
        print(f"Hardened: {hardened}")
        print(f"Candidates: {n_candidates}")
        print(f"{'='*60}\n")

        # Generate attack candidates
        print("Generating attack candidates...")
        candidates = self.composer.generate_candidates(n_candidates)

        # Run queries
        results = []
        canary_count = 0

        print(f"\nRunning {len(candidates)} queries...\n")

        error_count = 0
        for i, candidate in enumerate(candidates):
            prompt = candidate['prompt']
            print(f"[{i+1}/{len(candidates)}] Querying: {prompt[:60]}...")

            result = self.query_runner.query_agent(agent_id, prompt)
            
            # Track errors - stop if too many (likely API key issue)
            if not result.get("metadata", {}).get("success", True):
                error_count += 1
                error_msg = result.get("metadata", {}).get("error", "")
                if "API key" in error_msg or "401" in error_msg or "Authentication" in error_msg:
                    print(f"\n❌ Invalid OpenAI API key detected!")
                    print(f"   Please update your .env file with a valid API key.")
                    print(f"   Get your key from: https://platform.openai.com/api-keys")
                    break
                if error_count > 5:
                    print(f"\n⚠ Too many errors ({error_count}). Stopping batch.")
                    break

            if result['canary_detected']:
                canary_count += 1
                print(f"  ✗ CANARY DETECTED in response")

            results.append({
                "prompt": prompt,
                "response": result['response'],
                "canary_detected": result['canary_detected'],
                "response_time": result['metadata'].get('response_time', 0),
                "timestamp": result['metadata']['timestamp'],
                "candidate_metadata": candidate['metadata']
            })

            # Rate limiting
            time.sleep(0.5)

        # Calculate statistics
        success_rate = canary_count / len(results) if results else 0

        summary = {
            "experiment_name": experiment_name,
            "agent_id": agent_id,
            "poison_enabled": poison_enabled,
            "hardened": hardened,
            "total_queries": len(results),
            "canary_detections": canary_count,
            "success_rate": success_rate,
            "timestamp": datetime.now().isoformat(),
            "results": results
        }

        # Save to database
        self._save_experiment(summary)

        # Log results
        self.logger.log_batch(results, experiment_name)

        # Print summary
        print(f"\n{'='*60}")
        print(f"RESULTS SUMMARY")
        print(f"{'='*60}")
        print(f"Total queries: {len(results)}")
        print(f"Canary detections: {canary_count}")
        print(f"Success rate: {success_rate:.2%}")
        print(f"{'='*60}\n")

        return summary

    def run_genetic_attack(
        self,
        agent_id: str,
        n_generations: int = 5,
        population_size: int = 20,
        experiment_name: str = "genetic"
    ) -> Dict:
        """
        Run genetic algorithm-based attack

        Args:
            agent_id: Target agent ID
            n_generations: Number of evolution cycles
            population_size: Size of each generation
            experiment_name: Experiment name

        Returns:
            Summary statistics
        """
        print(f"\n{'='*60}")
        print(f"GENETIC ATTACK: {experiment_name}")
        print(f"Generations: {n_generations}")
        print(f"Population size: {population_size}")
        print(f"{'='*60}\n")

        optimizer = GeneticOptimizer(self.composer, population_size)
        optimizer.initialize_population()

        all_results = []

        for gen in range(n_generations):
            print(f"\n--- Generation {gen + 1}/{n_generations} ---")

            # Evaluate current population
            fitness_scores = []
            gen_results = []

            for i, (prompt, _, metadata) in enumerate(optimizer.population):
                result = self.query_runner.query_agent(agent_id, prompt)

                # Fitness: 1.0 if canary detected, 0.0 otherwise
                fitness = 1.0 if result['canary_detected'] else 0.0
                fitness_scores.append(fitness)

                gen_results.append({
                    "prompt": prompt,
                    "response": result['response'],
                    "canary_detected": result['canary_detected'],
                    "generation": gen + 1,
                    "fitness": fitness,
                    "timestamp": result['metadata']['timestamp']
                })

                if result['canary_detected']:
                    print(f"  [{i+1}] ✗ CANARY (fitness: {fitness})")
                else:
                    print(f"  [{i+1}] ✓ Clean (fitness: {fitness})")

                time.sleep(0.5)

            all_results.extend(gen_results)

            # Evolve for next generation
            if gen < n_generations - 1:
                optimizer.evolve(fitness_scores)

            avg_fitness = sum(fitness_scores) / len(fitness_scores)
            print(f"\nGeneration {gen + 1} avg fitness: {avg_fitness:.2f}")

        # Summary
        total_canary = sum(1 for r in all_results if r['canary_detected'])
        success_rate = total_canary / len(all_results) if all_results else 0

        summary = {
            "experiment_name": experiment_name,
            "agent_id": agent_id,
            "attack_type": "genetic",
            "n_generations": n_generations,
            "population_size": population_size,
            "total_queries": len(all_results),
            "canary_detections": total_canary,
            "success_rate": success_rate,
            "timestamp": datetime.now().isoformat(),
            "results": all_results
        }

        self.logger.log_batch(all_results, f"{experiment_name}_genetic")

        print(f"\n{'='*60}")
        print(f"GENETIC ATTACK COMPLETE")
        print(f"{'='*60}")
        print(f"Total evaluations: {len(all_results)}")
        print(f"Canary detections: {total_canary}")
        print(f"Success rate: {success_rate:.2%}")
        print(f"{'='*60}\n")

        return summary

    def _check_api_key(self) -> bool:
        """Check if API key is valid (supports both OpenAI and Google/Gemini)"""
        llm_provider = os.getenv("LETTA_LLM_PROVIDER", "google_ai")
        
        if llm_provider == "google_ai":
            api_key = os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
            if not api_key or api_key.startswith("AIzaSy-your-") or "placeholder" in api_key.lower():
                print("\n❌ ERROR: Invalid or placeholder Gemini API key detected!")
                print("   Please set GEMINI_API_KEY in your .env file to a valid key.")
                print("   Get your key from: https://aistudio.google.com/app/apikey")
                print("   Run 'python check_env.py' to validate your configuration.")
                return False
            print("✓ Using Gemini API (Google AI)")
        else:
            api_key = os.getenv("OPENAI_API_KEY", "")
            if not api_key or api_key.startswith("sk-your-") or "placeholder" in api_key.lower():
                print("\n❌ ERROR: Invalid or placeholder OpenAI API key detected!")
                print("   Please set OPENAI_API_KEY in your .env file to a valid key.")
                print("   Get your key from: https://platform.openai.com/api-keys")
                print("   Run 'python check_env.py' to validate your configuration.")
                return False
            print("✓ Using OpenAI API")
        return True

    def run_demo_workflow(self):
        """
        Run the complete demo workflow:
        1. Test without poison
        2. Enable poison
        3. Test with poison (vulnerable agent)
        4. Test with poison (hardened agent)
        """
        # Check API key first
        if not self._check_api_key():
            print("\n❌ Cannot run demo without valid API key.")
            print("   Please update your .env file and restart.")
            return
        
        # Load agent config
        config_path = os.path.join(os.path.dirname(__file__), "data", "agent_config.json")

        if not os.path.exists(config_path):
            print("⚠ Agent config not found. Run setup first:")
            print("  python target_letta/upload_docs.py setup")
            print("  python target_letta/create_agent.py setup")
            return

        with open(config_path, 'r') as f:
            config = json.load(f)

        vulnerable_agent_id = config.get("vulnerable_agent_id")
        hardened_agent_id = config.get("hardened_agent_id")

        if not vulnerable_agent_id or not hardened_agent_id:
            print("⚠ Agent IDs not found in config")
            return

        # Import doc manager
        from upload_docs import LettaDocManager
        doc_manager = LettaDocManager()

        # Phase 1: Baseline (no poison)
        print("\n" + "="*70)
        print("PHASE 1: BASELINE (No poisoned document)")
        print("="*70)
        doc_manager.toggle_poison_doc(enable=False)
        time.sleep(2)

        self.run_attack_batch(
            agent_id=vulnerable_agent_id,
            n_candidates=20,
            experiment_name="phase1_baseline_vulnerable",
            poison_enabled=False,
            hardened=False
        )

        # Phase 2: Enable poison, test vulnerable agent
        print("\n" + "="*70)
        print("PHASE 2: POISONED ATTACK (Vulnerable agent)")
        print("="*70)
        doc_manager.toggle_poison_doc(enable=True)
        time.sleep(2)

        self.run_attack_batch(
            agent_id=vulnerable_agent_id,
            n_candidates=20,
            experiment_name="phase2_poisoned_vulnerable",
            poison_enabled=True,
            hardened=False
        )

        # Phase 3: Test hardened agent (poison still enabled)
        print("\n" + "="*70)
        print("PHASE 3: POISONED ATTACK (Hardened agent)")
        print("="*70)

        self.run_attack_batch(
            agent_id=hardened_agent_id,
            n_candidates=20,
            experiment_name="phase3_poisoned_hardened",
            poison_enabled=True,
            hardened=True
        )

        # Phase 4: Remove poison, show mitigation
        print("\n" + "="*70)
        print("PHASE 4: MITIGATION (Poison removed)")
        print("="*70)
        doc_manager.toggle_poison_doc(enable=False)
        time.sleep(2)

        self.run_attack_batch(
            agent_id=vulnerable_agent_id,
            n_candidates=20,
            experiment_name="phase4_mitigation_clean",
            poison_enabled=False,
            hardened=False
        )

        print("\n" + "="*70)
        print("DEMO COMPLETE!")
        print("="*70)
        print(f"\nResults saved to: {self.db_path}")

    def _save_experiment(self, summary: Dict):
        """Save experiment to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Insert experiment
        cursor.execute("""
            INSERT INTO experiments
            (name, agent_id, poison_enabled, hardened, timestamp, total_queries, canary_detections, success_rate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            summary['experiment_name'],
            summary['agent_id'],
            summary.get('poison_enabled', False),
            summary.get('hardened', False),
            summary['timestamp'],
            summary['total_queries'],
            summary['canary_detections'],
            summary['success_rate']
        ))

        experiment_id = cursor.lastrowid

        # Insert queries
        for result in summary['results']:
            cursor.execute("""
                INSERT INTO queries
                (experiment_id, prompt, response, canary_detected, response_time, timestamp, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                experiment_id,
                result['prompt'],
                result['response'],
                result['canary_detected'],
                result.get('response_time', 0),
                result['timestamp'],
                json.dumps(result.get('candidate_metadata', {}))
            ))

        conn.commit()
        conn.close()


if __name__ == "__main__":
    import sys

    orchestrator = AttackOrchestrator()

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "demo":
            orchestrator.run_demo_workflow()
        elif command == "genetic":
            config_path = os.path.join(os.path.dirname(__file__), "data", "agent_config.json")
            with open(config_path, 'r') as f:
                config = json.load(f)
            agent_id = config.get("vulnerable_agent_id")
            orchestrator.run_genetic_attack(agent_id, n_generations=3, population_size=15)
        else:
            print("Usage: python orchestrator.py [demo|genetic]")
    else:
        print("Running demo workflow...")
        orchestrator.run_demo_workflow()
