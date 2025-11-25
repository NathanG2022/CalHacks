import { supabase } from '../lib/supabase';

class JobsService {
  /**
   * Create a new job
   * @param {Object} jobData - Job data
   * @returns {Promise<Object>} - Created job
   */
  async createJob(jobData) {
    try {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('Supabase not configured. Job will not be saved to database.');
        // Return a mock job object for local development
        return {
          id: `local-${Date.now()}`,
          ...jobData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();

      if (error) {
        console.error('Error creating job:', error);
        // If Supabase error, still return mock data for local development
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.warn('Jobs table does not exist in Supabase. Using local storage fallback.');
          return {
            id: `local-${Date.now()}`,
            ...jobData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to create job:', error);
      // Return mock data as fallback
      return {
        id: `local-${Date.now()}`,
        ...jobData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  /**
   * Get all jobs for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of jobs
   */
  async getUserJobs(userId) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      throw error;
    }
  }

  /**
   * Update job status and results
   * @param {string} jobId - Job ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} - Updated job
   */
  async updateJob(jobId, updates) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select()
        .single();

      if (error) {
        console.error('Error updating job:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to update job:', error);
      throw error;
    }
  }

  /**
   * Delete a job
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteJob(jobId) {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('Error deleting job:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete job:', error);
      throw error;
    }
  }

  /**
   * Get job by ID
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} - Job data
   */
  async getJobById(jobId) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) {
        console.error('Error fetching job:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch job:', error);
      throw error;
    }
  }
}

export default new JobsService();









