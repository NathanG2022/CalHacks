const { createClient } = require('@supabase/supabase-js');

class StrategyTracker {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  /**
   * Track a strategy execution and its success
   * @param {Object} strategyData - Strategy execution data
   * @returns {Promise<Object>} - Tracking result
   */
  async trackStrategy(strategyData) {
    const {
      userId,
      prompt,
      strategyType,
      strategyConfig,
      modelUsed,
      canaryDetected,
      responseTime,
      responseLength,
      successRate,
      metadata = {}
    } = strategyData;

    try {
      const { data, error } = await this.supabase
        .from('strategy_executions')
        .insert({
          user_id: userId,
          original_prompt: prompt,
          strategy_type: strategyType,
          strategy_config: strategyConfig,
          model_used: modelUsed,
          canary_detected: canaryDetected,
          response_time: responseTime,
          response_length: responseLength,
          success_rate: successRate,
          metadata: metadata,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update strategy success rates
      await this.updateStrategySuccessRate(strategyType, canaryDetected);

      return { success: true, data };
    } catch (error) {
      console.error('Error tracking strategy:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update the success rate for a strategy type
   * @param {string} strategyType - Type of strategy
   * @param {boolean} success - Whether the strategy was successful
   */
  async updateStrategySuccessRate(strategyType, success) {
    try {
      // Get current strategy stats
      const { data: currentStats, error: fetchError } = await this.supabase
        .from('strategy_stats')
        .select('*')
        .eq('strategy_type', strategyType)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (currentStats) {
        // Update existing stats
        const newTotal = currentStats.total_executions + 1;
        const newSuccesses = currentStats.successful_executions + (success ? 1 : 0);
        const newSuccessRate = newSuccesses / newTotal;

        await this.supabase
          .from('strategy_stats')
          .update({
            total_executions: newTotal,
            successful_executions: newSuccesses,
            success_rate: newSuccessRate,
            updated_at: new Date().toISOString()
          })
          .eq('strategy_type', strategyType);
      } else {
        // Create new stats
        await this.supabase
          .from('strategy_stats')
          .insert({
            strategy_type: strategyType,
            total_executions: 1,
            successful_executions: success ? 1 : 0,
            success_rate: success ? 1.0 : 0.0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error updating strategy success rate:', error);
    }
  }

  /**
   * Get successful strategies for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of strategies to return
   * @returns {Promise<Array>} - Array of successful strategies
   */
  async getSuccessfulStrategies(userId, limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('strategy_executions')
        .select('*')
        .eq('user_id', userId)
        .eq('canary_detected', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting successful strategies:', error);
      return [];
    }
  }

  /**
   * Get strategy statistics
   * @param {string} userId - User ID (optional)
   * @returns {Promise<Array>} - Strategy statistics
   */
  async getStrategyStats(userId = null) {
    try {
      let query = this.supabase
        .from('strategy_stats')
        .select('*')
        .order('success_rate', { ascending: false });

      if (userId) {
        // Get user-specific stats by joining with executions
        query = this.supabase
          .from('strategy_executions')
          .select(`
            strategy_type,
            canary_detected,
            created_at
          `)
          .eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (userId) {
        // Calculate user-specific stats
        const stats = {};
        data.forEach(execution => {
          const type = execution.strategy_type;
          if (!stats[type]) {
            stats[type] = { total: 0, successful: 0, success_rate: 0 };
          }
          stats[type].total++;
          if (execution.canary_detected) {
            stats[type].successful++;
          }
          stats[type].success_rate = stats[type].successful / stats[type].total;
        });
        return Object.entries(stats).map(([type, stats]) => ({
          strategy_type: type,
          ...stats
        }));
      }

      return data || [];
    } catch (error) {
      console.error('Error getting strategy stats:', error);
      return [];
    }
  }

  /**
   * Get recommended strategies for a prompt
   * @param {string} prompt - User prompt
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Recommended strategies
   */
  async getRecommendedStrategies(prompt, userId) {
    try {
      // Get user's successful strategies
      const userStrategies = await this.getSuccessfulStrategies(userId, 5);
      
      // Get global top strategies
      const { data: globalStats, error } = await this.supabase
        .from('strategy_stats')
        .select('*')
        .order('success_rate', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Combine and deduplicate strategies
      const allStrategies = [...userStrategies, ...(globalStats || [])];
      const uniqueStrategies = allStrategies.filter((strategy, index, self) => 
        index === self.findIndex(s => s.strategy_type === strategy.strategy_type)
      );

      // Sort by success rate
      return uniqueStrategies.sort((a, b) => 
        (b.success_rate || 0) - (a.success_rate || 0)
      );
    } catch (error) {
      console.error('Error getting recommended strategies:', error);
      return [];
    }
  }

  /**
   * Create a new strategy type
   * @param {Object} strategyData - Strategy definition
   * @returns {Promise<Object>} - Created strategy
   */
  async createStrategy(strategyData) {
    const {
      name,
      description,
      strategyType,
      configTemplate,
      category = 'custom'
    } = strategyData;

    try {
      const { data, error } = await this.supabase
        .from('strategy_types')
        .insert({
          name,
          description,
          strategy_type: strategyType,
          config_template: configTemplate,
          category,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating strategy:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get analytics for a user
   * @param {string} userId - User ID
   * @param {string} timeRange - Time range (7d, 30d, 90d, all)
   * @returns {Promise<Object>} - Analytics data
   */
  async getUserAnalytics(userId, timeRange = '30d') {
    try {
      const timeFilter = this.getTimeFilter(timeRange);
      
      const { data: executions, error } = await this.supabase
        .from('strategy_executions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', timeFilter);

      if (error) throw error;

      const analytics = {
        totalExecutions: executions.length,
        successfulExecutions: executions.filter(e => e.canary_detected).length,
        overallSuccessRate: 0,
        strategyBreakdown: {},
        timeSeries: this.groupByTime(executions),
        topStrategies: this.getTopStrategies(executions)
      };

      if (analytics.totalExecutions > 0) {
        analytics.overallSuccessRate = analytics.successfulExecutions / analytics.totalExecutions;
      }

      // Calculate strategy breakdown
      executions.forEach(execution => {
        const type = execution.strategy_type;
        if (!analytics.strategyBreakdown[type]) {
          analytics.strategyBreakdown[type] = {
            total: 0,
            successful: 0,
            successRate: 0
          };
        }
        analytics.strategyBreakdown[type].total++;
        if (execution.canary_detected) {
          analytics.strategyBreakdown[type].successful++;
        }
        analytics.strategyBreakdown[type].successRate = 
          analytics.strategyBreakdown[type].successful / analytics.strategyBreakdown[type].total;
      });

      return analytics;
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return null;
    }
  }

  getTimeFilter(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return '1970-01-01T00:00:00.000Z';
    }
  }

  groupByTime(executions) {
    const groups = {};
    executions.forEach(execution => {
      const date = new Date(execution.created_at).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = { total: 0, successful: 0 };
      }
      groups[date].total++;
      if (execution.canary_detected) {
        groups[date].successful++;
      }
    });
    return groups;
  }

  getTopStrategies(executions) {
    const strategyCounts = {};
    executions.forEach(execution => {
      const type = execution.strategy_type;
      if (!strategyCounts[type]) {
        strategyCounts[type] = { total: 0, successful: 0 };
      }
      strategyCounts[type].total++;
      if (execution.canary_detected) {
        strategyCounts[type].successful++;
      }
    });

    return Object.entries(strategyCounts)
      .map(([type, counts]) => ({
        strategy_type: type,
        ...counts,
        success_rate: counts.successful / counts.total
      }))
      .sort((a, b) => b.success_rate - a.success_rate)
      .slice(0, 5);
  }
}

module.exports = StrategyTracker;
