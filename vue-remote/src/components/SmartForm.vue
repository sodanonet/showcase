<template>
  <div class="smart-form">
    <h3>Smart Form Demo</h3>
    <p>Showcasing Vue 3 form handling, validation, and reactivity</p>
    
    <form @submit.prevent="submitForm" class="form-container">
      <!-- Personal Information -->
      <div class="form-section">
        <h4>Personal Information</h4>
        
        <div class="form-group">
          <label for="name">Full Name *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            :class="{ 'error': errors.name }"
            placeholder="Enter your full name"
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="email">Email Address *</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            :class="{ 'error': errors.email, 'success': form.email && !errors.email }"
            placeholder="your.email@example.com"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          <span v-else-if="form.email && !errors.email" class="success-message">✓ Valid email</span>
        </div>

        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <!-- Preferences -->
      <div class="form-section">
        <h4>Preferences</h4>
        
        <div class="form-group">
          <label for="role">Role</label>
          <select id="role" v-model="form.role">
            <option value="">Select a role</option>
            <option value="developer">Developer</option>
            <option value="designer">Designer</option>
            <option value="manager">Manager</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label>Skills ({{ selectedSkills.length }} selected)</label>
          <div class="checkbox-group">
            <label 
              v-for="skill in availableSkills" 
              :key="skill"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                :value="skill"
                v-model="form.skills"
              />
              <span class="checkbox-custom"></span>
              {{ skill }}
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="experience">Experience Level</label>
          <div class="range-group">
            <input
              id="experience"
              type="range"
              min="0"
              max="10"
              v-model="form.experience"
              class="range-input"
            />
            <div class="range-labels">
              <span>Beginner</span>
              <span class="experience-value">{{ form.experience }} years</span>
              <span>Expert</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Message -->
      <div class="form-section">
        <h4>Additional Information</h4>
        
        <div class="form-group">
          <label for="message">Message</label>
          <textarea
            id="message"
            v-model="form.message"
            placeholder="Tell us more about yourself..."
            rows="4"
          ></textarea>
          <div class="char-counter">
            {{ form.message.length }}/500 characters
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label agreement-label">
            <input
              type="checkbox"
              v-model="form.agreeToTerms"
              :class="{ 'error': errors.agreeToTerms }"
            />
            <span class="checkbox-custom"></span>
            I agree to the <a href="#" @click.prevent>Terms and Conditions</a> *
          </label>
          <span v-if="errors.agreeToTerms" class="error-message">{{ errors.agreeToTerms }}</span>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="resetForm" class="btn-secondary">
          Reset Form
        </button>
        <button 
          type="submit" 
          class="btn-primary"
          :disabled="!isFormValid || isSubmitting"
        >
          <span v-if="isSubmitting">Submitting...</span>
          <span v-else>Submit Form</span>
        </button>
      </div>

      <!-- Form Summary -->
      <div v-if="showSummary" class="form-summary">
        <h4>Form Summary</h4>
        <div class="summary-content">
          <p><strong>Name:</strong> {{ form.name }}</p>
          <p><strong>Email:</strong> {{ form.email }}</p>
          <p><strong>Role:</strong> {{ form.role || 'Not specified' }}</p>
          <p><strong>Skills:</strong> {{ selectedSkills.join(', ') || 'None selected' }}</p>
          <p><strong>Experience:</strong> {{ form.experience }} years</p>
          <p v-if="form.message"><strong>Message:</strong> {{ form.message }}</p>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, reactive, watch } from 'vue';

export default {
  name: 'SmartForm',
  setup() {
    // Form data
    const form = reactive({
      name: '',
      email: '',
      phone: '',
      role: '',
      skills: [],
      experience: 2,
      message: '',
      agreeToTerms: false
    });

    // Form validation errors
    const errors = ref({});
    
    // Form state
    const isSubmitting = ref(false);
    const showSummary = ref(false);

    // Available skills
    const availableSkills = [
      'JavaScript', 'Vue.js', 'React', 'Angular', 'Node.js', 
      'Python', 'CSS', 'HTML', 'TypeScript', 'PHP'
    ];

    // Computed properties
    const selectedSkills = computed(() => form.skills);
    
    const isFormValid = computed(() => {
      return form.name.length > 0 && 
             form.email.length > 0 && 
             !errors.value.email && 
             form.agreeToTerms &&
             Object.keys(errors.value).length === 0;
    });

    // Validation functions
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const validateForm = () => {
      const newErrors = {};

      if (!form.name.trim()) {
        newErrors.name = 'Name is required';
      } else if (form.name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }

      if (!form.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(form.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!form.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }

      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    // Watch for email changes for real-time validation
    watch(() => form.email, (newEmail) => {
      if (newEmail && !validateEmail(newEmail)) {
        errors.value = { ...errors.value, email: 'Please enter a valid email address' };
      } else {
        const { email, ...otherErrors } = errors.value;
        errors.value = otherErrors;
      }
    });

    // Watch for name changes
    watch(() => form.name, (newName) => {
      if (newName.trim() && newName.length >= 2) {
        const { name, ...otherErrors } = errors.value;
        errors.value = otherErrors;
      }
    });

    // Watch for terms agreement
    watch(() => form.agreeToTerms, (agreed) => {
      if (agreed) {
        const { agreeToTerms, ...otherErrors } = errors.value;
        errors.value = otherErrors;
      }
    });

    // Form submission
    const submitForm = async () => {
      if (!validateForm()) {
        return;
      }

      isSubmitting.value = true;
      
      // Simulate API call
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        showSummary.value = true;
        
        // Scroll to summary
        setTimeout(() => {
          const summary = document.querySelector('.form-summary');
          if (summary) {
            summary.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        
      } catch (error) {
        console.error('Submission error:', error);
      } finally {
        isSubmitting.value = false;
      }
    };

    // Reset form
    const resetForm = () => {
      Object.assign(form, {
        name: '',
        email: '',
        phone: '',
        role: '',
        skills: [],
        experience: 2,
        message: '',
        agreeToTerms: false
      });
      errors.value = {};
      showSummary.value = false;
    };

    return {
      form,
      errors,
      isSubmitting,
      showSummary,
      availableSkills,
      selectedSkills,
      isFormValid,
      submitForm,
      resetForm
    };
  }
};
</script>

<style scoped>
.smart-form {
  margin-top: 20px;
}

.smart-form h3 {
  margin: 0 0 10px 0;
  color: #fdcb6e;
  font-size: 1.5em;
}

.smart-form p {
  margin: 0 0 20px 0;
  opacity: 0.9;
  font-size: 14px;
}

.form-container {
  background: rgba(255, 255, 255, 0.1);
  padding: 25px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.form-section {
  margin-bottom: 30px;
}

.form-section h4 {
  margin: 0 0 20px 0;
  color: #fff;
  font-size: 1.2em;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #fdcb6e;
  box-shadow: 0 0 0 3px rgba(253, 203, 110, 0.2);
}

.form-group input.error {
  border-color: #e17055;
  box-shadow: 0 0 0 3px rgba(225, 112, 85, 0.2);
}

.form-group input.success {
  border-color: #00b894;
  box-shadow: 0 0 0 3px rgba(0, 184, 148, 0.2);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.checkbox-label:hover {
  background: rgba(255, 255, 255, 0.1);
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 3px;
  display: inline-block;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-label input:checked + .checkbox-custom {
  background: #fdcb6e;
  border-color: #fdcb6e;
}

.checkbox-label input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 2px;
  color: #2d3436;
  font-weight: bold;
  font-size: 14px;
}

.range-group {
  margin-top: 10px;
}

.range-input {
  width: 100%;
  margin-bottom: 10px;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.experience-value {
  background: #fdcb6e;
  color: #2d3436;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.char-counter {
  text-align: right;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 5px;
}

.agreement-label {
  align-items: flex-start;
}

.agreement-label a {
  color: #fdcb6e;
  text-decoration: none;
}

.agreement-label a:hover {
  text-decoration: underline;
}

.error-message {
  color: #e17055;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.success-message {
  color: #00b894;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.btn-primary {
  background: #fdcb6e;
  color: #2d3436;
}

.btn-primary:hover:not(:disabled) {
  background: #f39c12;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(253, 203, 110, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.form-summary {
  margin-top: 30px;
  background: rgba(0, 184, 148, 0.2);
  border: 2px solid #00b894;
  border-radius: 8px;
  padding: 20px;
}

.form-summary h4 {
  margin: 0 0 15px 0;
  color: #00b894;
}

.summary-content p {
  margin: 8px 0;
  color: #fff;
}

@media (max-width: 768px) {
  .form-container {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .checkbox-group {
    grid-template-columns: 1fr;
  }
}
</style>