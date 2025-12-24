document.addEventListener('DOMContentLoaded', function() {
  const signUpButton = document.getElementById('signUp');
  const signInButton = document.getElementById('signIn');
  const container = document.getElementById('auth-container');
  
  // Check if we need to show register form from PHP
  const urlParams = new URLSearchParams(window.location.search);
  const showRegister = urlParams.get('register');
  
  if (showRegister === 'true') {
    container.classList.add('right-panel-active');
  }
  
  // Switch to Sign Up
  if (signUpButton) {
    signUpButton.addEventListener('click', () => {
      container.classList.add('right-panel-active');
      
      // Update URL without reload
      const url = new URL(window.location);
      url.searchParams.set('register', 'true');
      window.history.pushState({}, '', url);
    });
  }
  
  // Switch to Sign In
  if (signInButton) {
    signInButton.addEventListener('click', () => {
      container.classList.remove('right-panel-active');
      
      // Update URL without reload
      const url = new URL(window.location);
      url.searchParams.delete('register');
      window.history.pushState({}, '', url);
    });
  }
  
  // ====================== PASSWORD FEATURES ======================
  
  // Toggle password visibility
  const toggleButtons = document.querySelectorAll('.toggle-password');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const passwordInput = document.getElementById(targetId);
      const icon = this.querySelector('i');
      
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        this.classList.add('active');
        
        // Add temporary text
        this.setAttribute('title', 'Hide password');
      } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        this.classList.remove('active');
        
        // Add temporary text
        this.setAttribute('title', 'Show password');
      }
      
      // Focus back to input
      passwordInput.focus();
    });
  });
  
  // Password strength indicator for register form
  const registerPassword = document.getElementById('registerPassword');
  const strengthBar = document.getElementById('passwordStrength');
  const strengthText = document.getElementById('passwordStrengthText');
  
  if (registerPassword) {
    registerPassword.addEventListener('input', function() {
      const password = this.value;
      const strength = calculatePasswordStrength(password);
      
      // Update strength bar
      strengthBar.style.width = strength.percentage + '%';
      strengthBar.style.backgroundColor = strength.color;
      
      // Update text
      strengthText.textContent = strength.text;
      strengthText.style.color = strength.color;
    });
    
    // Show strength indicator on focus
    registerPassword.addEventListener('focus', function() {
      document.querySelector('.password-strength').style.opacity = '1';
    });
    
    // Hide strength indicator on blur if empty
    registerPassword.addEventListener('blur', function() {
      if (!this.value) {
        document.querySelector('.password-strength').style.opacity = '0.5';
      }
    });
  }
  
  // Password strength calculation function
  function calculatePasswordStrength(password) {
    let score = 0;
    
    if (!password) {
      return {
        percentage: 0,
        color: '#e9ecef',
        text: 'Password strength'
      };
    }
    
    // Length check
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 10;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    
    // Clamp score to 100
    score = Math.min(score, 100);
    
    // Determine strength level
    let color, text;
    
    if (score < 40) {
      color = '#dc3545'; // Red
      text = 'Weak password';
    } else if (score < 70) {
      color = '#ffc107'; // Yellow
      text = 'Moderate password';
    } else if (score < 90) {
      color = '#28a745'; // Green
      text = 'Strong password';
    } else {
      color = '#198754'; // Dark green
      text = 'Very strong password';
    }
    
    return {
      percentage: score,
      color: color,
      text: text
    };
  }
  
  // ====================== FORM VALIDATION ======================
  
  // Form validation
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      const email = this.querySelector('input[name="email"]');
      const password = this.querySelector('input[name="password"]');
      
      if (!email.value || !password.value) {
        e.preventDefault();
        showError('Please fill in all fields');
      }
    });
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      const name = this.querySelector('input[name="nama"]');
      const email = this.querySelector('input[name="email"]');
      const password = this.querySelector('input[name="password"]');
      
      if (!name.value || !email.value || !password.value) {
        e.preventDefault();
        showError('Please fill in all fields');
      } else if (password.value.length < 6) {
        e.preventDefault();
        showError('Password must be at least 6 characters');
      }
    });
  }
  
  // ====================== ANIMATIONS ======================
  
  // Add floating animation to social buttons
  const socialButtons = document.querySelectorAll('.social');
  socialButtons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // Add ripple effect to buttons
  const buttons = document.querySelectorAll('.auth-button');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const x = e.clientX - e.target.getBoundingClientRect().left;
      const y = e.clientY - e.target.getBoundingClientRect().top;
      
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
  
  // Add focus effects to inputs
  const inputs = document.querySelectorAll('.auth-input');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentElement.classList.remove('focused');
      }
    });
    
    // Check if input has value on load
    if (input.value) {
      input.parentElement.classList.add('focused');
    }
  });
  
  // Keyboard shortcut for toggling password (Alt+P)
  document.addEventListener('keydown', function(e) {
    // Check if we're in a password field
    const activeElement = document.activeElement;
    const isPasswordField = activeElement.type === 'password' || 
                           (activeElement.type === 'text' && 
                            (activeElement.id === 'loginPassword' || 
                             activeElement.id === 'registerPassword'));
    
    if (e.altKey && e.key === 'p' && isPasswordField) {
      e.preventDefault();
      
      // Find the toggle button for this field
      const fieldId = activeElement.id;
      const toggleButton = document.querySelector(`.toggle-password[data-target="${fieldId}"]`);
      
      if (toggleButton) {
        toggleButton.click();
      }
    }
  });
});

// Helper function to show error
function showError(message) {
  // Create error element
  const errorEl = document.createElement('div');
  errorEl.className = 'alert alert-danger alert-auth';
  errorEl.textContent = message;
  errorEl.style.animation = 'fadeIn 0.3s';
  
  // Insert at the beginning of the form
  const form = document.querySelector('form');
  if (form) {
    const firstChild = form.firstChild;
    form.insertBefore(errorEl, firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
      errorEl.style.animation = 'fadeOut 0.3s';
      setTimeout(() => {
        errorEl.remove();
      }, 300);
    }, 5000);
  }
}

// Add CSS animations for error messages and ripple effect
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-10px); }
  }
  
  .ripple {
    position: absolute;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  /* Password strength color classes */
  .strength-weak { background-color: #dc3545 !important; }
  .strength-moderate { background-color: #ffc107 !important; }
  .strength-strong { background-color: #28a745 !important; }
  .strength-very-strong { background-color: #198754 !important; }
  
  /* Tooltip for password toggle */
  .toggle-password::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    z-index: 1000;
  }
  
  .toggle-password:hover::after {
    opacity: 1;
  }
`;
document.head.appendChild(style);