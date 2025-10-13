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

async function submitContact(event) {
  event.preventDefault();

  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');

  // Disable submit button and show loading state
  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

  // Prepare email parameters for EmailJS
  const emailParams = {
    to_email: "donmarioslending@gmail.com",
    user_name: `${form.querySelector("#firstName").value} ${
      form.querySelector("#lastName").value
    }`,
    user_email: form.querySelector("#email").value,
    user_phone: form.querySelector("#phone").value,
    help_type: form.querySelector("#helpType").value,
    contact_method: form.querySelector("#contactMethod").value,
    user_message: form.querySelector("#message").value,
    timestamp: new Date().toLocaleString(),
  };

  try {
    // Send email using EmailJS
    await emailjs.send("service_da9g455", "template_5pxxy79", emailParams);

    console.log("Contact email sent successfully!");

    // Show success message
    showNotification(
      "Message sent successfully! We'll get back to you soon.",
      "success"
    );

    // Reset form
    form.reset();
  } catch (error) {
    console.error("Error sending contact email:", error);

    // Show error message
    showNotification(
      "Sorry, there was an error sending your message. Please try again.",
      "error"
    );
  } finally {
    // Re-enable submit button and restore original text
    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
  }
}

// Calendar Booking System
window.selectedDate = null;
window.selectedTime = null;
window.currentMonthOffset = 0; // Changed from week to month

// Business hours configuration (9 AM - 5 PM)
window.BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 17, // 5 PM (last slot starts at 4 PM)
};

// Initialize calendar on page load
function initializeCalendar() {
  const calendarDays = document.getElementById("calendarDays");
  if (calendarDays) {
    console.log("Initializing calendar...");
    renderCalendar();
    setupCalendarNavigation();
  }
}

// Wait for DOM to be fully ready before initializing
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(initializeCalendar, 100);
  });
} else {
  // DOM is already ready, wait a moment then initialize
  setTimeout(initializeCalendar, 100);
}

function renderCalendar() {
  const calendarDays = document.getElementById("calendarDays");
  const calendarTitle = document.getElementById("calendarTitle");

  if (!calendarDays || !calendarTitle) {
    console.error("Calendar elements not found!");
    return;
  }

  console.log("Rendering calendar...");
  calendarDays.innerHTML = "";

  // Ensure currentMonthOffset is initialized
  if (
    typeof window.currentMonthOffset === "undefined" ||
    window.currentMonthOffset === null
  ) {
    window.currentMonthOffset = 0;
    console.log("currentMonthOffset was undefined, setting to 0");
  }

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight

  console.log("Today:", today);
  console.log("Current month offset:", window.currentMonthOffset);

  // Calculate the month to display
  const displayMonth = new Date(
    today.getFullYear(),
    today.getMonth() + window.currentMonthOffset,
    1
  );

  // Get month name and year for title
  const monthName = displayMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  calendarTitle.textContent = monthName;

  // Get first day of the month and number of days
  const firstDay = new Date(
    displayMonth.getFullYear(),
    displayMonth.getMonth(),
    1
  );
  const lastDay = new Date(
    displayMonth.getFullYear(),
    displayMonth.getMonth() + 1,
    0
  );
  const daysInMonth = lastDay.getDate();

  console.log("Displaying month:", monthName);
  console.log("Days in month:", daysInMonth);

  // Render all days in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      displayMonth.getFullYear(),
      displayMonth.getMonth(),
      day
    );
    console.log("Creating day", day, ":", date);

    const dayElement = document.createElement("div");
    dayElement.className = "calendar-day";

    // Check if date is in the past
    const isPast = date < today;

    if (isPast) {
      dayElement.classList.add("disabled");
    } else {
      dayElement.addEventListener("click", () => selectDate(date, dayElement));
    }

    // Check if this is the selected date
    if (window.selectedDate && isSameDay(date, window.selectedDate)) {
      dayElement.classList.add("selected");
    }

    dayElement.innerHTML = `
      <span class="day-name">${getDayName(date)}</span>
      <span class="day-number">${date.getDate()}</span>
    `;

    calendarDays.appendChild(dayElement);
  }

  // Update navigation buttons
  const prevBtn = document.getElementById("prevWeek");
  const nextBtn = document.getElementById("nextWeek");

  if (prevBtn && nextBtn) {
    // Disable prev if we're at the current month
    prevBtn.disabled = window.currentMonthOffset <= 0;

    // Allow navigation to future months (up to 12 months ahead)
    nextBtn.disabled = window.currentMonthOffset >= 11;
  }
}

function setupCalendarNavigation() {
  const prevBtn = document.getElementById("prevWeek");
  const nextBtn = document.getElementById("nextWeek");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (window.currentMonthOffset > 0) {
        window.currentMonthOffset--;
        renderCalendar();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      // Allow up to 12 months ahead
      if (window.currentMonthOffset < 11) {
        window.currentMonthOffset++;
        renderCalendar();
      }
    });
  }
}

function selectDate(date, element) {
  window.selectedDate = date;
  window.selectedTime = null;

  // Update calendar day selection
  document.querySelectorAll(".calendar-day").forEach((day) => {
    day.classList.remove("selected");
  });
  element.classList.add("selected");

  // Update selected date text
  const selectedDateText = document.getElementById("selectedDateText");
  if (selectedDateText) {
    selectedDateText.textContent = `Available slots for ${formatDateLong(
      date
    )}`;
  }

  // Render time slots
  renderTimeSlots(date);

  // Hide booking form
  const bookingFormWrapper = document.getElementById("bookingFormWrapper");
  if (bookingFormWrapper) {
    bookingFormWrapper.style.display = "none";
  }
}

async function renderTimeSlots(date) {
  const timeSlotsGrid = document.getElementById("timeSlotsGrid");
  if (!timeSlotsGrid) return;

  timeSlotsGrid.innerHTML = "<p>Loading available slots...</p>";

  // Ensure BUSINESS_HOURS is initialized
  if (!window.BUSINESS_HOURS) {
    window.BUSINESS_HOURS = {
      start: 9,
      end: 17,
    };
  }

  // Format date for database query
  const dateString = formatDateForDB(date);

  // Check Firebase for existing bookings on this date
  let bookedSlots = [];
  try {
    if (typeof firebase !== "undefined" && firebase.firestore) {
      const bookingsRef = firebase.firestore().collection("bookings");
      const snapshot = await bookingsRef.where("date", "==", dateString).get();

      bookedSlots = snapshot.docs.map((doc) => doc.data().time);
      console.log("Booked slots for", dateString, ":", bookedSlots);
    }
  } catch (error) {
    console.error("Error checking bookings:", error);
  }

  timeSlotsGrid.innerHTML = "";

  // Generate time slots from 9 AM to 5 PM (last slot at 4 PM for 1-hour slots)
  for (
    let hour = window.BUSINESS_HOURS.start;
    hour < window.BUSINESS_HOURS.end;
    hour++
  ) {
    const slotElement = document.createElement("div");
    slotElement.className = "time-slot";

    const timeStart = formatTime(hour, 0);
    const timeEnd = formatTime(hour + 1, 0);
    const displayTime = `${timeStart} - ${timeEnd}`;

    // Check if this slot is already booked
    const isBooked = bookedSlots.includes(displayTime);

    if (isBooked) {
      slotElement.classList.add("disabled");
      slotElement.innerHTML = `
        <div class="time-slot-time">
          <i class="fas fa-lock"></i>
          ${displayTime}
          <span style="font-size: 0.8rem; display: block; margin-top: 0.25rem;">Booked</span>
        </div>
      `;
    } else {
      slotElement.innerHTML = `
        <div class="time-slot-time">
          <i class="fas fa-clock"></i>
          ${displayTime}
        </div>
      `;
      slotElement.addEventListener("click", () =>
        selectTimeSlot(date, displayTime, slotElement)
      );
    }

    timeSlotsGrid.appendChild(slotElement);
  }

  // Show message if all slots are booked
  if (
    bookedSlots.length ===
    window.BUSINESS_HOURS.end - window.BUSINESS_HOURS.start
  ) {
    timeSlotsGrid.innerHTML =
      "<p style='text-align: center; color: #64748b; padding: 2rem;'><i class='fas fa-calendar-times' style='font-size: 2rem; display: block; margin-bottom: 1rem;'></i>All time slots are booked for this day.<br>Please select another date.</p>";
  }
}

function selectTimeSlot(date, time, element) {
  window.selectedTime = time;

  // Update time slot selection
  document.querySelectorAll(".time-slot").forEach((slot) => {
    slot.classList.remove("selected");
  });
  element.classList.add("selected");

  // Show booking form
  showBookingForm(date, time);
}

function showBookingForm(date, time) {
  const bookingFormWrapper = document.getElementById("bookingFormWrapper");
  const confirmDate = document.getElementById("confirmDate");
  const confirmTime = document.getElementById("confirmTime");

  if (bookingFormWrapper && confirmDate && confirmTime) {
    confirmDate.textContent = formatDateLong(date);
    confirmTime.textContent = time;
    bookingFormWrapper.style.display = "block";

    // Smooth scroll to form
    bookingFormWrapper.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function cancelBooking() {
  const bookingFormWrapper = document.getElementById("bookingFormWrapper");
  if (bookingFormWrapper) {
    bookingFormWrapper.style.display = "none";
  }

  // Clear selections
  document.querySelectorAll(".time-slot").forEach((slot) => {
    slot.classList.remove("selected");
  });

  window.selectedTime = null;

  // Reset form
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.reset();
  }
}

async function submitBooking(event) {
  event.preventDefault();

  if (!window.selectedDate || !window.selectedTime) {
    showNotification("Please select a date and time slot.", "error");
    return;
  }

  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');

  // Disable submit button and show loading state
  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';

  // Collect form data
  const bookingData = {
    name: form.querySelector("#bookingName").value,
    email: form.querySelector("#bookingEmail").value,
    phone: form.querySelector("#bookingPhone").value,
    reason: form.querySelector("#bookingReason").value,
    notes: form.querySelector("#bookingNotes").value,
    date: formatDateLong(window.selectedDate),
    dateDB: formatDateForDB(window.selectedDate),
    time: window.selectedTime,
    timestamp: new Date().toISOString(),
  };

  try {
    // Save booking to Firebase
    if (typeof firebase !== "undefined" && firebase.firestore) {
      await firebase.firestore().collection("bookings").add({
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        reason: bookingData.reason,
        notes: bookingData.notes,
        date: bookingData.dateDB,
        time: bookingData.time,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: "pending",
      });

      console.log("Booking saved to Firebase successfully!");
    }

    // Send email notification via EmailJS
    const emailParams = {
      to_email: "donmarioslending@gmail.com",
      client_name: bookingData.name,
      client_email: bookingData.email,
      client_phone: bookingData.phone,
      booking_date: bookingData.date,
      booking_time: bookingData.time,
      booking_reason: bookingData.reason,
      booking_notes: bookingData.notes || "None provided",
      timestamp: new Date().toLocaleString(),
    };

    // Send email using EmailJS
    await emailjs.send("service_da9g455", "template_jb47jus", emailParams);

    console.log("Email sent successfully!");

    // Show success notification
    showNotification(
      `Booking confirmed for ${bookingData.date} at ${window.selectedTime}! You'll receive a confirmation email shortly.`,
      "success"
    );
  } catch (error) {
    console.error("Error processing booking:", error);
    showNotification("Error processing booking. Please try again.", "error");
    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="fas fa-check"></i> Confirm Booking';
    return;
  }

  // Reset everything
  form.reset();
  const bookingFormWrapper = document.getElementById("bookingFormWrapper");
  if (bookingFormWrapper) {
    bookingFormWrapper.style.display = "none";
  }

  // Clear selections
  window.selectedDate = null;
  window.selectedTime = null;
  document.querySelectorAll(".calendar-day.selected").forEach((day) => {
    day.classList.remove("selected");
  });
  document.querySelectorAll(".time-slot.selected").forEach((slot) => {
    slot.classList.remove("selected");
  });

  // Reset time slots
  const timeSlotsGrid = document.getElementById("timeSlotsGrid");
  if (timeSlotsGrid) {
    timeSlotsGrid.innerHTML = "";
  }

  const selectedDateText = document.getElementById("selectedDateText");
  if (selectedDateText) {
    selectedDateText.textContent = "Select a date to see available time slots";
  }

  // Re-enable submit button
  submitButton.disabled = false;
  submitButton.innerHTML = '<i class="fas fa-check"></i> Confirm Booking';
}

// Helper functions
function getDayName(date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

function formatTime(hour, minute) {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

function formatDateLong(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

function formatDateRange(startDate, endDate) {
  const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }
}

function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function formatDateForDB(date) {
  // Format date as YYYY-MM-DD for database consistency
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
