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

  // Validate inputs silently - if invalid, just return without showing errors
  if (
    isNaN(homePrice) ||
    isNaN(downPayment) ||
    isNaN(interestRate) ||
    isNaN(loanTerm) ||
    homePrice <= 0 ||
    downPayment <= 0 ||
    downPayment >= homePrice ||
    interestRate <= 0
  ) {
    return;
  }

  // Validate property tax and insurance
  const annualPropertyTax =
    parseFloat(document.getElementById("propertyTax").value) || 0;
  const annualInsurance =
    parseFloat(document.getElementById("insurance").value) || 0;

  if (annualPropertyTax < 0 || annualInsurance < 0) {
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

  // Calculate monthly property tax and insurance
  const propertyTax = annualPropertyTax / 12;
  const insurance = annualInsurance / 12;

  // Calculate total cost over the loan term (all monthly payments combined)
  const totalMonthlyPayment = monthlyPayment + propertyTax + insurance;
  const totalCost = totalMonthlyPayment * numberOfPayments;

  // Update display with animation
  updateCalculatorResults(
    monthlyPayment,
    propertyTax,
    insurance,
    monthlyPayment + propertyTax + insurance,
    totalCost,
    homePrice,
    downPayment
  );
}

function updateCalculatorResults(
  principalInterest,
  propertyTax,
  insurance,
  totalMonthly,
  totalCost,
  homePrice,
  downPayment
) {
  // Animate the payment amount
  const monthlyPaymentElement = document.getElementById("monthlyPayment");
  const principalInterestElement = document.getElementById("principalInterest");
  const propertyTaxElement = document.getElementById("propertyTaxResult");
  const insuranceElement = document.getElementById("insuranceResult");
  const totalCostElement = document.getElementById("totalCost");

  // Add animation class
  monthlyPaymentElement.style.transform = "scale(1.1)";
  monthlyPaymentElement.style.transition = "transform 0.3s ease";

  // Update values with formatting
  principalInterestElement.textContent = formatCurrency(principalInterest);
  propertyTaxElement.textContent = formatCurrency(propertyTax);
  insuranceElement.textContent = formatCurrency(insurance);

  // Update monthly payment (sum of all components)
  monthlyPaymentElement.textContent = formatCurrency(
    principalInterest + propertyTax + insurance
  );

  // Update total cost
  totalCostElement.textContent = formatCurrency(totalCost);

  // Update loan summary
  document.getElementById("loanAmount").textContent = formatCurrency(
    homePrice - downPayment
  );
  document.getElementById("downPaymentPercent").textContent =
    Math.round((downPayment / homePrice) * 100) + "%";
  document.getElementById("totalInterest").textContent = formatCurrency(
    totalCost - (homePrice - downPayment)
  );

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
document
  .getElementById("propertyTax")
  .addEventListener("input", calculateMortgage);
document
  .getElementById("insurance")
  .addEventListener("input", calculateMortgage);

// Calculate initial values on page load
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("homePrice")) {
    calculateMortgage();
  }

  // Update mortgage rates
  updateMortgageRates();
});

// Function to fetch and update mortgage rates from FRED API
async function updateMortgageRates() {
  try {
    // FRED API endpoints for mortgage rates
    const rateEndpoints = {
      "30-yr-fixed": "MORTGAGE30US",
      "15-yr-fixed": "MORTGAGE15US",
      "30-yr-fha": "MORTGAGE30US", // Using 30-yr as base for FHA
      "30-yr-va": "MORTGAGE30US", // Using 30-yr as base for VA
      "30-yr-jumbo": "MORTGAGE30US", // Using 30-yr as base for Jumbo
    };

    // Update the date
    const today = new Date();
    const dateString = today.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const dateElement = document.querySelector(".rates-date");
    if (dateElement) {
      dateElement.textContent = `Updated ${dateString}`;
    }

    // Fetch rates from FRED API (Federal Reserve Economic Data)
    const apiKey = "f22bba4838165111bfce44bc4b748836"; // Your FRED API key

    // For now, we'll use fallback rates while you get your API key
    const fallbackRates = {
      "30-yr-fixed": 6.484,
      "15-yr-fixed": 5.875,
      "30-yr-fha": 6.249,
      "30-yr-va": 6.037,
      "30-yr-jumbo": 6.678,
    };

    // Try to fetch real rates (when API key is available)
    if (apiKey !== "YOUR_FRED_API_KEY") {
      const promises = Object.entries(rateEndpoints).map(
        async ([rateType, endpoint]) => {
          try {
            const response = await fetch(
              `https://api.stlouisfed.org/fred/series/observations?series_id=${endpoint}&api_key=${apiKey}&file_type=json&limit=1&sort_order=desc`
            );
            const data = await response.json();

            if (data.observations && data.observations.length > 0) {
              const latestRate = parseFloat(data.observations[0].value);
              return { rateType, rate: latestRate };
            }
          } catch (error) {
            console.log(`Error fetching ${rateType}:`, error);
          }
          return { rateType, rate: fallbackRates[rateType] };
        }
      );

      const results = await Promise.all(promises);

      // Update the UI with fetched rates
      results.forEach(({ rateType, rate }) => {
        updateRateDisplay(rateType, rate);
      });
    } else {
      // Use fallback rates when no API key
      Object.entries(fallbackRates).forEach(([rateType, rate]) => {
        updateRateDisplay(rateType, rate);
      });
    }
  } catch (error) {
    console.error("Error updating mortgage rates:", error);

    // Use fallback rates on error
    const fallbackRates = {
      "30-yr-fixed": 6.484,
      "15-yr-fixed": 5.875,
      "30-yr-fha": 6.249,
      "30-yr-va": 6.037,
      "30-yr-jumbo": 6.678,
    };

    Object.entries(fallbackRates).forEach(([rateType, rate]) => {
      updateRateDisplay(rateType, rate);
    });
  }
}

// Helper function to update rate display in UI
function updateRateDisplay(rateType, newRate) {
  const rateElements = document.querySelectorAll(".rate-item");

  rateElements.forEach((element) => {
    const label = element
      .querySelector(".rate-label")
      .textContent.toLowerCase();

    // Match rate type to UI element
    let matches = false;
    if (rateType === "30-yr-fixed" && label.includes("30-yr. fixed"))
      matches = true;
    if (rateType === "15-yr-fixed" && label.includes("15-yr. fixed"))
      matches = true;
    if (rateType === "30-yr-fha" && label.includes("30-yr. fha"))
      matches = true;
    if (rateType === "30-yr-va" && label.includes("30-yr. va")) matches = true;
    if (rateType === "30-yr-jumbo" && label.includes("30-yr. jumbo"))
      matches = true;

    if (matches) {
      const rateValueElement = element.querySelector(".rate-value");
      const rateChangeElement = element.querySelector(".rate-change");

      if (rateValueElement) {
        const oldRate = parseFloat(
          rateValueElement.textContent.replace("%", "")
        );
        const change = newRate - oldRate;

        // Update rate value
        rateValueElement.textContent = `${newRate.toFixed(3)}%`;

        // Update change indicator
        if (rateChangeElement && Math.abs(change) > 0.001) {
          rateChangeElement.textContent =
            change > 0 ? `+${change.toFixed(3)}` : change.toFixed(3);
          rateChangeElement.className = `rate-change ${
            change > 0 ? "up" : "down"
          }`;
        }
      }
    }
  });
}

// Set up automatic rate updates every hour
setInterval(updateMortgageRates, 3600000); // Update every hour

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
  const mailtoLink = `mailto:donmarioslending@gmail.com?subject=New Application - ${
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
  const submitButton = form.querySelector('button[type="submit"]');

  // Disable submit button and show loading state
  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

  // Prepare template parameters
  const templateParams = {
    firstName: form.querySelector("#firstName").value,
    lastName: form.querySelector("#lastName").value,
    email: form.querySelector("#email").value,
    phone: form.querySelector("#phone").value,
    helpType: form.querySelector("#helpType").value,
    contactMethod: form.querySelector("#contactMethod").value,
    message: form.querySelector("#message").value,
    to_email: "donmarioslending@gmail.com",
  };

  // Send email using EmailJS
  emailjs
    .send("default_service", "YOUR_TEMPLATE_ID", templateParams)
    .then(
      function (response) {
        // Show success message
        showNotification(
          "Message sent successfully! We'll get back to you soon.",
          "success"
        );

        // Reset form
        form.reset();
      },
      function (error) {
        // Show error message
        showNotification(
          "Sorry, there was an error sending your message. Please try again.",
          "error"
        );
      }
    )
    .finally(function () {
      // Re-enable submit button and restore original text
      submitButton.disabled = false;
      submitButton.innerHTML =
        '<i class="fas fa-paper-plane"></i> Send Message';
    });
}
