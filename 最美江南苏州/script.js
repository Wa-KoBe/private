document.addEventListener('DOMContentLoaded', () => {
    // Intro Scroll State
    let isIntroActive = true;
    let isIntroVisible = false;
    let targetScrollProgress = 0; // Target value for smooth scroll
    let currentScrollProgress = 0; // Current rendered value
    let introRafId = null; // Animation frame ID
    
    // Initial State: Hide content for intro
    document.body.classList.add('intro-active');

    // 1. Loading Animation
    const loader = document.getElementById('loader');
    
    // Simulate resource loading
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                
                // Trigger Scroll Intro
                const scrollIntro = document.getElementById('scroll-intro');
                if (scrollIntro) {
                    scrollIntro.classList.add('active');
                    isIntroVisible = true;
                    // Lock body scroll during intro
                    document.body.style.overflow = 'hidden';
                } else {
                    isIntroActive = false;
                }
            }, 800);
        }, 1500); // Minimum view time
        // 10. Interactive Background on Card Hover (Book-flipping effect)
    const contentSections = document.querySelectorAll('.content-section');

    contentSections.forEach(section => {
        const cards = section.querySelectorAll('.frosted-card');
        
        cards.forEach(card => {
            // Pre-calculate high-res image path or use data-bg if available
            // If data-bg is not set, fallback to the image src inside the card
            let bgUrl = card.getAttribute('data-bg');
            if (!bgUrl) {
                const img = card.querySelector('img.card-image');
                if (img) {
                    bgUrl = img.src;
                    // Auto-set data-bg for consistency
                    card.setAttribute('data-bg', bgUrl);
                }
            }

            if (bgUrl) {
                card.addEventListener('mouseenter', () => {
                    // Add class to hide the default CSS ::before overlay
                    section.classList.add('hover-bg');

                    // Apply overlay and new background image
                    // Reduced opacity to 0.05 for maximum clarity while keeping minimal text protection
                    section.style.backgroundImage = `linear-gradient(rgba(249,246,240,0.05), rgba(249,246,240,0.05)), url('${bgUrl}')`;
                    // Ensure properties are set for the inline style to override CSS correctly
                    section.style.backgroundSize = 'cover';
                    section.style.backgroundPosition = 'center';
                    section.style.backgroundAttachment = 'fixed'; 

                    // Text move and fade effect
                    const textBlock = section.querySelector('.text-block');
                    if (textBlock && window.innerWidth > 1024) { // Only on desktop
                        const cardRect = card.getBoundingClientRect();
                        const textRect = textBlock.getBoundingClientRect();
                        
                        if (textRect.left < cardRect.left) {
                            textBlock.classList.add('slide-out-left');
                        } else {
                            textBlock.classList.add('slide-out-right');
                        }
                    }
                });

                card.addEventListener('mouseleave', () => {
                    // Remove class to restore the default CSS ::before overlay
                    section.classList.remove('hover-bg');

                    // Revert to original CSS styles by clearing inline styles
                    section.style.backgroundImage = '';
                    section.style.backgroundSize = '';
                    section.style.backgroundPosition = '';
                    section.style.backgroundAttachment = '';

                    // Restore text block
                    const textBlock = section.querySelector('.text-block');
                    if (textBlock) {
                        textBlock.classList.remove('slide-out-left', 'slide-out-right');
                    }
                });
            }
        });
    });
});

    // 2. Throttle Function for Performance
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Scroll Indicator Logic
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const nextSection = document.getElementById('impression');
            if (nextSection) {
                smoothScrollTo(nextSection, 1500); // Slower for better elastic effect
            }
        });
    }

    // 3. Navbar Scroll Effect & Back to Top
    const navbar = document.getElementById('navbar');
    const backToTopBtn = document.getElementById('backToTop');
    
    const handleScroll = () => {
        const scrolled = window.scrollY;
        
        // Navbar transparency
        if (scrolled > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top visibility
        if (scrolled > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }

        // Rotate dividers based on scroll
        document.querySelectorAll('.window-pattern').forEach(pattern => {
            const rect = pattern.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                // Calculate rotation based on position
                const rotation = (window.innerHeight - rect.top) * 0.1;
                pattern.style.transform = `rotate(${rotation}deg)`;
            }
        });

        // Scroll Spy
        const sections = document.querySelectorAll('section'); // Ensure sections have IDs matching nav links
        const navLinks = document.querySelectorAll('.nav-item');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Adjustment for header height (80px) + buffer
            if (scrolled >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', throttle(handleScroll, 20));

    // Helper: Elastic Easing Function (Ease Out Back)
    function easeOutBack(t, b, c, d, s) {
        // s controls the overshoot amount. 1.70158 is default.
        // Higher s = more bounce.
        if (s == undefined) s = 1.5; 
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    }

    // Custom Elastic Scroll Function
    function smoothScrollTo(target, duration = 1000) {
        const targetElement = (typeof target === 'string') ? document.querySelector(target) : target;
        if (!targetElement) return;

        const startPosition = window.pageYOffset;
        // Account for fixed header (approx 80px)
        const headerOffset = 80;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            
            // Apply easing
            const run = easeOutBack(timeElapsed, startPosition, distance, duration);
            
            window.scrollTo(0, run);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    // 4. Elastic Smooth Scroll for Anchors & Back to Top
    document.querySelectorAll('a[href^="#"], #backToTop').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href') || '#';
            
            if (this.id === 'backToTop' || targetId === '#') {
                smoothScrollTo(document.body, 1200);
            } else {
                smoothScrollTo(targetId, 1200);
            }

            // Close mobile menu if open
            if (typeof mobileDrawer !== 'undefined' && mobileDrawer) {
                mobileDrawer.classList.remove('active');
            }
        });
    });

    // 5. Intersection Observer for Scroll Reveal
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-scroll]').forEach(el => {
        observer.observe(el);
    });

    // 6. Mobile Menu Logic
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    menuBtn.addEventListener('click', () => {
        mobileDrawer.classList.toggle('active');
        // Animate links staggered
        if (mobileDrawer.classList.contains('active')) {
            drawerLinks.forEach((link, index) => {
                link.style.transitionDelay = `${0.1 + index * 0.1}s`;
            });
        } else {
            drawerLinks.forEach(link => {
                link.style.transitionDelay = '0s';
            });
        }
    });

    // Close drawer when clicking outside (optional enhancement)
    document.addEventListener('click', (e) => {
        if (!mobileDrawer.contains(e.target) && !menuBtn.contains(e.target) && mobileDrawer.classList.contains('active')) {
            mobileDrawer.classList.remove('active');
        }
    });

    // 7. Ripple Effect & Vibration for Buttons
    document.querySelectorAll('.ripple-btn, .mobile-menu-btn, .frosted-card').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Haptic Feedback for Mobile
            if (navigator.vibrate) {
                navigator.vibrate(15);
            }

            // Ripple logic only for buttons (optional for cards to keep it clean)
            if (this.classList.contains('ripple-btn') || this.classList.contains('mobile-menu-btn')) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const circle = document.createElement('span');
                circle.classList.add('ripple');
                circle.style.left = `${x}px`;
                circle.style.top = `${y}px`;
                circle.style.width = circle.style.height = `${Math.max(rect.width, rect.height)}px`;

                this.appendChild(circle);

                setTimeout(() => {
                    circle.remove();
                }, 600);
            }
            
            // Micro-vibration animation
            this.style.transform = 'scale(0.98)';
            setTimeout(() => this.style.transform = '', 100); // Clear inline transform to allow hover effects
        });
    });

    // 8. Card Modal Logic
    const modal = document.getElementById('cardModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalDesc = modal.querySelector('.modal-desc');
    const modalClose = modal.querySelector('.modal-close');

    document.querySelectorAll('.frosted-card').forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h3').innerText;
            const desc = card.querySelector('p').innerText;
            const hiddenInfo = card.querySelector('.card-hidden-info');
            const cardImg = card.querySelector('img.card-image'); // Check if card has an image

            modalTitle.innerText = title;
            
            // If hidden info exists, use it to populate the modal content with formatting
            if (hiddenInfo) {
                // Create a structured HTML for the modal description
                let contentHTML = '';
                
                // If the card has a real image, add it to the top of the modal content
                if (cardImg) {
                    contentHTML += `<div class="modal-image-container"><img src="${cardImg.src}" alt="${title}" class="modal-image"></div>`;
                }

                contentHTML += `<p class="modal-intro">${desc}</p>`;
                contentHTML += `<div class="modal-details">${hiddenInfo.innerHTML}</div>`;
                modalDesc.innerHTML = contentHTML;
            } else {
                // Fallback for cards without hidden info
                modalDesc.innerText = desc + " 这里可以展示更多关于" + title + "的详细介绍，包括历史典故、游览攻略等内容。";
            }
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // 9. Ink Cursor Trail
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;

    document.addEventListener('mousemove', throttle((e) => {
        const now = Date.now();
        const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
        
        // Only create dot if moved enough distance or time passed
        if (dist > 30 || now - lastTime > 50) {
            createInkDot(e.clientX, e.clientY, dist);
            lastX = e.clientX;
            lastY = e.clientY;
            lastTime = now;
        }
    }, 20));

    function createInkDot(x, y, speed) {
        const dot = document.createElement('div');
        dot.classList.add('ink-trail');
        const size = Math.max(10, 50 - speed * 0.5); // Faster movement = smaller dots
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        
        document.body.appendChild(dot);
        
        setTimeout(() => {
            dot.remove();
        }, 1000);
    }

    // 9. Falling Petals Effect
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        setInterval(() => {
            if (document.hidden) return; // Save performance
            createPetal();
        }, 300);
    }

    function createPetal() {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        
        // Randomize
        const startLeft = Math.random() * 100;
        const size = Math.random() * 10 + 5;
        const duration = Math.random() * 5 + 5;
        
        petal.style.left = `${startLeft}%`;
        petal.style.width = `${size}px`;
        petal.style.height = `${size * 1.5}px`; // Oval shape
        petal.style.animationDuration = `${duration}s`;
        
        heroSection.appendChild(petal);
        
        // Cleanup
        setTimeout(() => {
            petal.remove();
        }, duration * 1000);
    }

    // 11. Water Drop Text Effect (Fisheye/Magnify)
    const textBlocks = document.querySelectorAll('.text-block');

    textBlocks.forEach(block => {
        // Select text elements within text-block that should react
        const textElements = block.querySelectorAll('h2, p, h3');
        
        textElements.forEach(el => {
            // Split text into characters
            const text = el.innerText;
            const chars = text.split('');
            
            // Reconstruct with spans
            el.innerHTML = '';
            chars.forEach(char => {
                const span = document.createElement('span');
                span.innerText = char;
                span.classList.add('water-drop-char');
                // Preserve spaces
                if (char === ' ') {
                    span.style.width = '0.25em'; 
                    span.style.display = 'inline-block';
                }
                el.appendChild(span);
            });
        });

        // Mousemove event for the block
        block.addEventListener('mousemove', (e) => {
            // Use requestAnimationFrame for performance
            requestAnimationFrame(() => {
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                const radius = 60; // Effect radius
                const maxScale = 1.5; // Max magnification

                const spans = block.querySelectorAll('.water-drop-char');
                spans.forEach(span => {
                    const rect = span.getBoundingClientRect();
                    const spanX = rect.left + rect.width / 2;
                    const spanY = rect.top + rect.height / 2;

                    const dist = Math.sqrt(Math.pow(mouseX - spanX, 2) + Math.pow(mouseY - spanY, 2));

                    if (dist < radius) {
                        const scale = 1 + (maxScale - 1) * (1 - dist / radius);
                        span.style.transform = `scale(${scale})`;
                        span.style.fontWeight = 'bold'; // Optional: add weight
                        span.style.color = 'var(--c-rouge)'; // Optional: highlight color
                    } else {
                        span.style.transform = 'scale(1)';
                        span.style.fontWeight = '';
                        span.style.color = '';
                    }
                });
            });
        });

        // Reset on mouse leave
        block.addEventListener('mouseleave', () => {
            const spans = block.querySelectorAll('.water-drop-char');
            spans.forEach(span => {
                span.style.transform = 'scale(1)';
                span.style.fontWeight = '';
                span.style.color = '';
            });
        });
    });

    // Helper: Get current dominant section
    function getDominantSection() {
        const sections = [
            document.querySelector('.hero'),
            document.getElementById('impression'),
            document.getElementById('culture'),
            document.getElementById('gardens'),
            document.getElementById('cuisine')
        ].filter(el => el);

        if (sections.length === 0) return null;

        let currentSectionIndex = 0;
        let maxVisibleHeight = 0;
        const windowHeight = window.innerHeight;

        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const visibleTop = Math.max(0, rect.top);
            const visibleBottom = Math.min(windowHeight, rect.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);

            if (visibleHeight > maxVisibleHeight) {
                maxVisibleHeight = visibleHeight;
                currentSectionIndex = index;
            }
        });

        return {
            section: sections[currentSectionIndex],
            index: currentSectionIndex,
            sections: sections
        };
    }

    // Helper: Update Scroll Intro Animation (Triggered by Wheel)
    function updateScrollIntro(delta) {
        if (!isIntroVisible) return;
        
        // Sensitivity: pixels of scroll needed to fully open
        // Lower value = more scrolling required
        const sensitivity = 0.06; 
        
        targetScrollProgress += delta * sensitivity;
        
        // Clamp Target 0 to 100
        if (targetScrollProgress < 0) targetScrollProgress = 0;
        if (targetScrollProgress > 100) targetScrollProgress = 100;

        // Start Animation Loop if not running
        if (!introRafId) {
            introRafId = requestAnimationFrame(renderScrollIntro);
        }
    }

    // Flag to prevent multiple triggers of the welcome sequence
    let isWelcomeSequenceStarted = false;

    // Render Loop for Smooth Animation
    function renderScrollIntro() {
        // Lerp factor (adjust for smoothness/speed, 0.1 is standard smooth)
        const lerpFactor = 0.08;
        
        // Interpolate current towards target
        currentScrollProgress += (targetScrollProgress - currentScrollProgress) * lerpFactor;
        
        // Snap to target if very close to avoid infinite small updates
        if (Math.abs(targetScrollProgress - currentScrollProgress) < 0.1) {
            currentScrollProgress = targetScrollProgress;
        }
        
        // --- CSS Art Animation Logic ---
        const openRatio = currentScrollProgress / 100;
        const width = openRatio * 900; // Max width 900px
        
        const root = document.documentElement;
        root.style.setProperty('--scroll-width', `${width}px`);
        root.style.setProperty('--scroll-open-percent', openRatio);

        // Text Overlay Visibility
        const textOverlay = document.querySelector('.scroll-text-overlay');
        if (textOverlay) {
            if (openRatio > 0.8) {
                textOverlay.classList.add('visible');
            } else {
                textOverlay.classList.remove('visible');
            }
        }
        
        // Check completion (Trigger Welcome Text)
        if (currentScrollProgress >= 99.5 && !isWelcomeSequenceStarted) {
            currentScrollProgress = 100; // Force finish
            isWelcomeSequenceStarted = true;
            
            // 1. Hide Scroll Hint
            const scrollHint = document.querySelector('.scroll-hint');
            if (scrollHint) scrollHint.classList.add('hidden');

            // 2. Show Welcome Text
            const welcomeText = document.querySelector('.intro-welcome-text');
            if (welcomeText) {
                welcomeText.classList.add('visible');
            }

            // 3. Delay final transition to allow reading and animation
            setTimeout(() => {
                completeIntro();
            }, 3500); // 3.5 seconds reading time

            if (introRafId) {
                cancelAnimationFrame(introRafId);
                introRafId = null;
            }
            return;
        }

        // Continue loop if not reached target or not finished
        if (currentScrollProgress !== targetScrollProgress) {
            introRafId = requestAnimationFrame(renderScrollIntro);
        } else {
            introRafId = null; // Stop loop if idle
        }
    }

    function completeIntro() {
        if (!isIntroActive) return;
        isIntroActive = false;
        
        // Reveal Page Content
        document.body.classList.remove('intro-active');
        
        const scrollIntro = document.getElementById('scroll-intro');
        if (scrollIntro) {
            scrollIntro.classList.add('finished');
            setTimeout(() => {
                scrollIntro.style.display = 'none';
            }, 1000);
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Optional: Trigger Hero animations manually if they depend on visibility
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            // Reset opacity to ensure transition works with the new class removal
            heroContent.style.opacity = '0';
            requestAnimationFrame(() => {
                heroContent.style.transition = 'opacity 1s ease';
                heroContent.style.opacity = '1';
            });
        }
    }

    // 12. Wheel Scroll Navigation (Elastic Page Transition)
    let isWheeling = false;
    let scrollAccumulator = 0;
    let resetAccumulatorTimer = null;
    const SCROLL_THRESHOLD = 200; // Threshold for triggering page switch (adds resistance)

    window.addEventListener('wheel', (e) => {
        // 0. Intro Scroll Priority
        if (isIntroActive && isIntroVisible) {
            e.preventDefault();
            updateScrollIntro(e.deltaY);
            return;
        }

        // Ignore if modal is open
        if (document.body.style.overflow === 'hidden') return;

        const dominance = getDominantSection();
        if (!dominance) return;

        const { section, index, sections } = dominance;
        const rect = section.getBoundingClientRect();
        const delta = e.deltaY;
        const headerOffset = 80;
        const buffer = 5;
        const windowHeight = window.innerHeight;

        // If currently animating, block interaction
        if (isWheeling) {
            e.preventDefault();
            return;
        }

        // Ignore small movements (trackpad sensitivity)
        if (Math.abs(delta) < 5) return;

        // Reset accumulator if scrolling stops
        if (resetAccumulatorTimer) clearTimeout(resetAccumulatorTimer);
        resetAccumulatorTimer = setTimeout(() => {
            scrollAccumulator = 0;
        }, 200);

        if (delta > 0) {
            // Scrolling Down
            // If current section has more content below, let native scroll handle it
            if (rect.bottom > windowHeight + buffer) {
                scrollAccumulator = 0; // Not at edge, reset resistance
                return;
            }
            
            // If at bottom and not the last section, trigger elastic scroll to next
            if (index < sections.length - 1) {
                e.preventDefault();
                
                // Add "resistance" - only trigger if user scrolls enough at the edge
                scrollAccumulator += delta;
                
                if (scrollAccumulator > SCROLL_THRESHOLD) {
                    isWheeling = true;
                    smoothScrollTo(sections[index + 1], 1500);
                    setTimeout(() => { isWheeling = false; scrollAccumulator = 0; }, 1500);
                }
            }
        } else {
            // Scrolling Up
            // If current section has more content above (considering header offset), let native scroll handle it
            // We use headerOffset - buffer because the section top aligns with the bottom of the header
            if (rect.top < headerOffset - buffer) {
                scrollAccumulator = 0;
                return;
            }

            // If at top and not the first section, trigger elastic scroll to prev
            if (index > 0) {
                e.preventDefault();
                
                // Add "resistance"
                scrollAccumulator += delta;

                if (scrollAccumulator < -SCROLL_THRESHOLD) {
                    isWheeling = true;
                    smoothScrollTo(sections[index - 1], 1500);
                    setTimeout(() => { isWheeling = false; scrollAccumulator = 0; }, 1500);
                }
            }
        }
    }, { passive: false });

    // 13. Touch Scroll Navigation (Mobile)
    let lastTouchY = 0;
    let touchAccumulator = 0;
    const TOUCH_THRESHOLD = 80; // Distance in pixels to trigger swipe

    window.addEventListener('touchstart', (e) => {
        lastTouchY = e.touches[0].clientY;
        touchAccumulator = 0;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (document.body.style.overflow === 'hidden') return;
        
        if (isWheeling) {
            e.preventDefault();
            return;
        }

        const currentY = e.touches[0].clientY;
        const stepDelta = lastTouchY - currentY; // Positive = Scrolling Down (Moving Finger Up)
        lastTouchY = currentY;

        const dominance = getDominantSection();
        if (!dominance) return;

        const { section, index, sections } = dominance;
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const headerOffset = 80;
        const buffer = 5;

        // Logic mirrors wheel but uses stepDelta and touchAccumulator
        if (stepDelta > 0) { // Scrolling Down
            if (rect.bottom > windowHeight + buffer) {
                touchAccumulator = 0;
                return;
            }
            
            if (index < sections.length - 1) {
                // At bottom edge
                touchAccumulator += stepDelta;
                
                if (touchAccumulator > TOUCH_THRESHOLD) {
                    e.preventDefault();
                    isWheeling = true;
                    smoothScrollTo(sections[index + 1], 1500);
                    setTimeout(() => { isWheeling = false; touchAccumulator = 0; }, 1500);
                }
            }
        } else { // Scrolling Up
            if (rect.top < headerOffset - buffer) {
                touchAccumulator = 0;
                return;
            }

            if (index > 0) {
                // At top edge
                touchAccumulator += stepDelta; // stepDelta is negative here

                if (touchAccumulator < -TOUCH_THRESHOLD) {
                    e.preventDefault();
                    isWheeling = true;
                    smoothScrollTo(sections[index - 1], 1500);
                    setTimeout(() => { isWheeling = false; touchAccumulator = 0; }, 1500);
                }
            }
        }
    }, { passive: false });
});
