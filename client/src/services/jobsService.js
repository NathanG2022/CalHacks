import { supabase } from '../lib/supabase';

class JobsService {
  /**
   * Create a new job
   * @param {Object} jobData - Job data
   * @returns {Promise<Object>} - Created job
   */
  async createJob(jobData) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();

      if (error) {
        console.error('Error creating job:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to create job:', error);
      throw error;
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









