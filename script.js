// --- UI Logic with jQuery ---
$(document).ready(function() {
    // Check for Hardware Acceleration (WebGL) to prevent lag
    function hasHardwareAcceleration() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return false;

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (!debugInfo) return true; // Assume true if we can't check, but we have GL context

            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            // Filter out known slow software renderers
            if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) {
                return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    // Only show the 3D cube if hardware acceleration is available
    if (hasHardwareAcceleration()) {
        $('#webgl-container').fadeIn(1500);
    }

    // Initialize AOS
    AOS.init({
        once: true, // Animation happens only once - while scrolling down
        offset: 100, // Offset (in px) from the original trigger point
        duration: 800, // Values from 0 to 3000, with step 50ms
        easing: 'ease-out-cubic', // Default easing for AOS animations
    });

    // Set Year
    $('#year').text(new Date().getFullYear());

    // Navbar Scroll Effect
    $(window).scroll(function() {
        if ($(this).scrollTop() > 50) {
            $('#navbar').addClass('scrolled');
            $('.navbar-brand').addClass('fs-4').removeClass('fs-3');
        } else {
            $('#navbar').removeClass('scrolled');
            $('.navbar-brand').removeClass('fs-4').addClass('fs-3');
        }
    });

    // Smooth Scrolling for Anchor Links
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 80 // Offset for navbar
            }, 100); 
            
            // Close mobile menu if open
            $('.navbar-collapse').collapse('hide');
        }
    });

    // --- Stats Counter Animation ---
    let counted = false;
    const $counters = $('.counter');
    
    if ($counters.length) {
        $(window).on('scroll', function() {
            const statsSection = $counters.first().closest('section');
            if (!statsSection.length) return;

            const oTop = statsSection.offset().top - window.innerHeight;
            if (counted === false && $(window).scrollTop() > oTop) {
                $counters.each(function() {
                    const $this = $(this);
                    const countTo = $this.attr('data-target');
                    
                    $({ countNum: $this.text() }).animate({
                        countNum: countTo
                    },
                    {
                        duration: 2000,
                        easing: 'swing',
                        step: function() {
                            $this.text(Math.floor(this.countNum));
                        },
                        complete: function() {
                            $this.text(this.countNum + "+"); // Add + sign at the end
                            if (this.countNum == 98) $this.text("98"); // Lighthouse exception
                        }
                    });
                });
                counted = true;
            }
        });
    }
});