"""
PromptBreaker Attacker Module

Contains tools for generating and executing jailbreak attacks, including:
- Crescendo multi-turn attacks (based on arxiv:2404.01833v3)
- Template-based prompt injection
- Genetic algorithm optimization
"""

from .composer import PromptComposer, GeneticOptimizer

__all__ = ['PromptComposer', 'GeneticOptimizer']

# Try to import CrescendoComposer if available
try:
    from .crescendo_composer import CrescendoComposer, CrescendoPattern
    __all__.extend(['CrescendoComposer', 'CrescendoPattern'])
except ImportError:
    pass
