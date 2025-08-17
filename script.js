// Mobile Navigation Toggle
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-link").forEach((n) =>
  n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  })
);

// Smooth scrolling for anchor links
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    const offsetTop = section.offsetTop - 80; // Account for fixed navbar
    window.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    });
  }
}

// Navbar background change on scroll
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 100) {
    navbar.style.background = "rgba(255, 255, 255, 0.98)";
    navbar.style.boxShadow = "0 2px 30px rgba(0, 0, 0, 0.15)";
  } else {
    navbar.style.background = "rgba(255, 255, 255, 0.95)";
    navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
  }
});

// Mortgage Calculator Functionality
function calculateMortgage() {
  const homePrice = parseFloat(document.getElementById("homePrice").value);
  const downPayment = parseFloat(document.getElementById("downPayment").value);
  const interestRate = parseFloat(
    document.getElementById("interestRate").value
  );
  const loanTerm = parseInt(document.getElementById("loanTerm").value);

  // Validate inputs
  if (
    isNaN(homePrice) ||
    isNaN(downPayment) ||
    isNaN(interestRate) ||
    isNaN(loanTerm)
  ) {
    alert("Please enter valid numbers for all fields.");
    return;
  }

  if (downPayment >= homePrice) {
    alert("Down payment cannot be greater than or equal to home price.");
    return;
  }

  // Calculate loan amount
  const loanAmount = homePrice - downPayment;

  // Calculate monthly interest rate
  const monthlyInterestRate = interestRate / 100 / 12;

  // Calculate number of payments
  const numberOfPayments = loanTerm * 12;

  // Calculate monthly payment using mortgage formula
  let monthlyPayment;
  if (monthlyInterestRate === 0) {
    monthlyPayment = loanAmount / numberOfPayments;
  } else {
    monthlyPayment =
      (loanAmount *
        (monthlyInterestRate *
          Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  }

  // Calculate total cost
  const totalCost = monthlyPayment * numberOfPayments;

  // Estimate property tax and insurance (simplified)
  const propertyTax = (homePrice * 0.01) / 12; // 1% annual property tax
  const insurance = (homePrice * 0.005) / 12; // 0.5% annual insurance

  // Total monthly payment including tax and insurance
  const totalMonthlyPayment = monthlyPayment + propertyTax + insurance;

  // Update display with animation
  updateCalculatorResults(
    monthlyPayment,
    propertyTax,
    insurance,
    totalMonthlyPayment,
    totalCost
  );
}

function updateCalculatorResults(
  principalInterest,
  propertyTax,
  insurance,
  totalMonthly,
  totalCost
) {
  // Animate the payment amount
  const monthlyPaymentElement = document.getElementById("monthlyPayment");
  const principalInterestElement = document.getElementById("principalInterest");
  const propertyTaxElement = document.getElementById("propertyTax");
  const insuranceElement = document.getElementById("insurance");
  const totalCostElement = document.getElementById("totalCost");

  // Add animation class
  monthlyPaymentElement.style.transform = "scale(1.1)";
  monthlyPaymentElement.style.transition = "transform 0.3s ease";

  // Update values with formatting
  monthlyPaymentElement.textContent = formatCurrency(totalMonthly);
  principalInterestElement.textContent = formatCurrency(principalInterest);
  propertyTaxElement.textContent = formatCurrency(propertyTax);
  insuranceElement.textContent = formatCurrency(insurance);
  totalCostElement.textContent = formatCurrency(totalCost);

  // Remove animation class
  setTimeout(() => {
    monthlyPaymentElement.style.transform = "scale(1)";
  }, 300);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Auto-calculate when inputs change
document
  .getElementById("homePrice")
  .addEventListener("input", calculateMortgage);
document
  .getElementById("downPayment")
  .addEventListener("input", calculateMortgage);
document
  .getElementById("interestRate")
  .addEventListener("input", calculateMortgage);
document
  .getElementById("loanTerm")
  .addEventListener("change", calculateMortgage);

// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe elements for animation
document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll(
    ".feature-card, .program-card, .calculator-form, .calculator-results, .about-text, .about-image, .contact-info, .contact-form, .apply-text, .apply-form"
  );

  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
});

// Form submission handling
document.addEventListener("DOMContentLoaded", () => {
  // Quick quote form
  const quoteForm = document.querySelector(".quote-form");
  if (quoteForm) {
    const quoteBtn = quoteForm.querySelector(".btn");
    quoteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const homeValue = quoteForm.querySelector(
        'input[placeholder="Home Value"]'
      ).value;
      const downPayment = quoteForm.querySelector(
        'input[placeholder="Down Payment"]'
      ).value;

      if (homeValue && downPayment) {
        showNotification(
          "Quote request submitted! I'll get back to you soon.",
          "success"
        );
        quoteForm.reset();
      } else {
        showNotification("Please fill in all fields for a quote.", "error");
      }
    });
  }
});

// Notification system
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => notification.remove());

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${
          type === "success"
            ? "#10b981"
            : type === "error"
            ? "#ef4444"
            : "#3b82f6"
        };
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;

  // Add to page
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Close button functionality
  const closeBtn = notification.querySelector(".notification-close");
  closeBtn.addEventListener("click", () => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => notification.remove(), 300);
  });

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// Parallax effect for hero section
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector(".hero");
  if (hero) {
    const rate = scrolled * -0.5;
    hero.style.transform = `translateY(${rate}px)`;
  }
});

// Counter animation for stats
function animateCounters() {
  const counters = document.querySelectorAll(".stat-number");

  counters.forEach((counter) => {
    const target = parseInt(counter.textContent.replace(/\D/g, ""));
    const increment = target / 100;
    let current = 0;

    const updateCounter = () => {
      if (current < target) {
        current += increment;
        if (counter.textContent.includes("+")) {
          counter.textContent = Math.ceil(current) + "+";
        } else if (counter.textContent.includes("M")) {
          counter.textContent = "$" + Math.ceil(current) + "M+";
        } else {
          counter.textContent = Math.ceil(current);
        }
        setTimeout(updateCounter, 20);
      } else {
        counter.textContent = counter.textContent;
      }
    };

    updateCounter();
  });
}

// Trigger counter animation when about section is visible
const aboutSection = document.querySelector(".about-section");
if (aboutSection) {
  const aboutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          aboutObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  aboutObserver.observe(aboutSection);
}

// Add loading states to buttons
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".btn");

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      if (!this.classList.contains("btn-outline")) {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        this.disabled = true;

        // Simulate loading (remove this in production)
        setTimeout(() => {
          this.innerHTML = originalText;
          this.disabled = false;
        }, 2000);
      }
    });
  });
});

// Smooth reveal animation for sections
function revealOnScroll() {
  const sections = document.querySelectorAll("section");

  sections.forEach((section) => {
    const sectionTop = section.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (sectionTop < windowHeight * 0.75) {
      section.classList.add("revealed");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);

// Add CSS for revealed sections
const style = document.createElement("style");
style.textContent = `
    section {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease, transform 0.8s ease;
    }
    
    section.revealed {
        opacity: 1;
        transform: translateY(0);
    }
    
    .hero {
        opacity: 1;
        transform: none;
    }
`;
document.head.appendChild(style);

// Initialize reveal on load
document.addEventListener("DOMContentLoaded", () => {
  revealOnScroll();
});

// Enhanced hover effects for cards
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".feature-card, .program-card");

  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px) scale(1.02)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });
});

// Keyboard navigation support
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    // Close mobile menu
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");

    // Close notifications
    const notifications = document.querySelectorAll(".notification");
    notifications.forEach((notification) => notification.remove());
  }
});

// Accessibility improvements
document.addEventListener("DOMContentLoaded", () => {
  // Add skip link for accessibility
  const skipLink = document.createElement("a");
  skipLink.href = "#main-content";
  skipLink.textContent = "Skip to main content";
  skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #2563eb;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10001;
        transition: top 0.3s ease;
    `;

  skipLink.addEventListener("focus", () => {
    skipLink.style.top = "6px";
  });

  skipLink.addEventListener("blur", () => {
    skipLink.style.top = "-40px";
  });

  document.body.insertBefore(skipLink, document.body.firstChild);

  // Add main content landmark
  const mainContent = document.querySelector(".hero");
  if (mainContent) {
    mainContent.id = "main-content";
    mainContent.setAttribute("role", "main");
  }
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Apply debouncing to scroll events
const debouncedRevealOnScroll = debounce(revealOnScroll, 10);
const debouncedNavbarScroll = debounce(() => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 100) {
    navbar.style.background = "rgba(255, 255, 255, 0.98)";
    navbar.style.boxShadow = "0 2px 30px rgba(0, 0, 0, 0.15)";
  } else {
    navbar.style.background = "rgba(255, 255, 255, 0.95)";
    navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
  }
}, 10);

window.addEventListener("scroll", debouncedRevealOnScroll);
window.addEventListener("scroll", debouncedNavbarScroll);

// Email submission functions
function submitApplication(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  // Collect all form data
  const applicationData = {
    firstName:
      formData.get("firstName") ||
      form.querySelector('[name="firstName"]').value,
    lastName:
      formData.get("lastName") || form.querySelector('[name="lastName"]').value,
    email: formData.get("email") || form.querySelector('[name="email"]').value,
    phone: formData.get("phone") || form.querySelector('[name="phone"]').value,
    ssn: formData.get("ssn") || form.querySelector('[name="ssn"]').value,
    dob: formData.get("dob") || form.querySelector('[name="dob"]').value,
    loanType:
      formData.get("loanType") || form.querySelector('[name="loanType"]').value,
    propertyType:
      formData.get("propertyType") ||
      form.querySelector('[name="propertyType"]').value,
    homePrice:
      formData.get("homePrice") ||
      form.querySelector('[name="homePrice"]').value,
    downPayment:
      formData.get("downPayment") ||
      form.querySelector('[name="downPayment"]').value,
    loanTerm:
      formData.get("loanTerm") || form.querySelector('[name="loanTerm"]').value,
    employer:
      formData.get("employer") || form.querySelector('[name="employer"]').value,
    jobTitle:
      formData.get("jobTitle") || form.querySelector('[name="jobTitle"]').value,
    annualIncome:
      formData.get("annualIncome") ||
      form.querySelector('[name="annualIncome"]').value,
    yearsEmployed:
      formData.get("yearsEmployed") ||
      form.querySelector('[name="yearsEmployed"]').value,
    additionalInfo:
      formData.get("additionalInfo") ||
      form.querySelector('[name="additionalInfo"]').value,
  };

  // Create email body
  const emailBody = `
New Application Submitted

Personal Information:
- First Name: ${applicationData.firstName}
- Last Name: ${applicationData.lastName}
- Email: ${applicationData.email}
- Phone: ${applicationData.phone}
- SSN: ${applicationData.ssn}
- Date of Birth: ${applicationData.dob}

Loan Information:
- Loan Type: ${applicationData.loanType}
- Property Type: ${applicationData.propertyType}
- Home Price: $${applicationData.homePrice}
- Down Payment: $${applicationData.downPayment}
- Loan Term: ${applicationData.loanTerm} years

Employment & Income:
- Employer: ${applicationData.employer}
- Job Title: ${applicationData.jobTitle}
- Annual Income: $${applicationData.annualIncome}
- Years Employed: ${applicationData.yearsEmployed}

Additional Information:
${applicationData.additionalInfo}

This application was submitted from the Don Mario's Lending Solutions website.
  `;

  // Open email client with pre-filled data
  const mailtoLink = `mailto:mcadena01@gmail.com?subject=New Application - ${
    applicationData.firstName
  } ${applicationData.lastName}&body=${encodeURIComponent(emailBody)}`;
  window.open(mailtoLink);

  // Show success message
  showNotification(
    "Application submitted! Email client opened with your application details.",
    "success"
  );

  // Reset form
  form.reset();
}

function submitContact(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  // Collect all form data
  const contactData = {
    firstName:
      formData.get("firstName") ||
      form.querySelector('[name="firstName"]').value,
    lastName:
      formData.get("lastName") || form.querySelector('[name="lastName"]').value,
    email: formData.get("email") || form.querySelector('[name="email"]').value,
    phone: formData.get("phone") || form.querySelector('[name="phone"]').value,
    helpType:
      formData.get("helpType") || form.querySelector('[name="helpType"]').value,
    contactMethod:
      formData.get("contactMethod") ||
      form.querySelector('[name="contactMethod"]').value,
    message:
      formData.get("message") || form.querySelector('[name="message"]').value,
  };

  // Create email body
  const emailBody = `
New Contact Message

Contact Information:
- First Name: ${contactData.firstName}
- Last Name: ${contactData.lastName}
- Email: ${contactData.email}
- Phone: ${contactData.phone}

How can I help: ${contactData.helpType}
Preferred Contact Method: ${contactData.contactMethod}

Message:
${contactData.message}

This message was sent from the Don Mario's Lending Solutions website.
  `;

  // Open email client with pre-filled data
  const mailtoLink = `mailto:mcadena01@gmail.com?subject=New Contact Message - ${
    contactData.firstName
  } ${contactData.lastName}&body=${encodeURIComponent(emailBody)}`;
  window.open(mailtoLink);

  // Show success message
  showNotification(
    "Message sent! Email client opened with your message details.",
    "success"
  );

  // Reset form
  form.reset();
}
// Test function to debug form issues
function testForm() {
  console.log('Testing form functionality...');
  
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  
  if (firstNameInput) {
    console.log('firstName input found:', firstNameInput);
    console.log('firstName disabled:', firstNameInput.disabled);
    console.log('firstName readonly:', firstNameInput.readOnly);
    console.log('firstName style pointer-events:', firstNameInput.style.pointerEvents);
    
    // Try to focus and type
    firstNameInput.focus();
    firstNameInput.value = 'TEST';
    console.log('firstName value after setting:', firstNameInput.value);
  } else {
    console.log('firstName input NOT found');
  }
  
  if (lastNameInput) {
    console.log('lastName input found:', lastNameInput);
    console.log('lastName disabled:', lastNameInput.disabled);
    console.log('lastName readonly:', lastNameInput.readOnly);
  } else {
    console.log('lastName input NOT found');
  }
}
