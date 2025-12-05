document.addEventListener('DOMContentLoaded', function(){
  // remove the loading state so the page fades in, unless user prefers reduced motion
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced){
    setTimeout(function(){ document.body.classList.remove('is-loading'); }, 20);
  } else {
    document.body.classList.remove('is-loading');
  }

  // global link handler - fade animation for page navigation
  document.addEventListener('click', function(e){
    const a = e.target.closest('a');
    if(!a) return;
    const href = a.getAttribute('href');
    if(!href) return;
    if(a.target === '_blank' || a.hasAttribute('download')) return;
    if(href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    // allow internal anchors to scroll (CSS handles smooth-scroll)
    if(href.startsWith('#')) return;
    try{
      const url = new URL(href, location.href);
      if(url.origin !== location.origin) return; // external link
      // fade out and navigate
      e.preventDefault();
      if(!reduced){
        document.body.classList.add('is-loading');
        setTimeout(function(){ location.href = url.href; }, 380);
      } else {
        // Instantly navigate when user prefers reduced motion
        location.href = url.href;
      }
    }catch(err){ /* invalid url - ignore */ }
  }, {capture:true});

  // keyboard accessibility: enable enter press for nav items
  document.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && document.activeElement && document.activeElement.tagName === 'A'){
      const a = document.activeElement;
      if(a && a.href){
        document.body.classList.add('is-loading');
      }
    }
  });

  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim().toLowerCase();
      const message = contactForm.message.value.trim();
      if(!name || !email || !message){
        alert('Please complete the contact form.');
        return;
      }
      // For a demo, save messages in localStorage
      const messages = JSON.parse(localStorage.getItem('acme_messages') || '[]');
      messages.push({name, email, message, date: new Date().toISOString()});
      localStorage.setItem('acme_messages', JSON.stringify(messages));
      alert('Thanks for getting in touch! We will contact you soon.');
      contactForm.reset();
    });
  }
  // update nav active link when page loads and scrolling
  const navLinks = document.querySelectorAll('.nav-links a');
  if(navLinks.length){
    const sections = [];
    
    // Build array of sections with their nav links
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if(href && href.startsWith('#')){
        const section = document.querySelector(href);
        if(section){
          sections.push({ link, section });
        }
      }
    });
    
    function setActiveLink(activeLink){
      navLinks.forEach(link => link.classList.remove('active'));
      if(activeLink) activeLink.classList.add('active');
    }
    
    let currentActiveLink = null;
    
    // Function to update active nav based on scroll position
    function updateActiveNav(){
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const headerOffset = 120;
      const triggerPoint = scrollY + headerOffset;
      
      let activeLink = null;
      
      // Find the section that is currently at or just above the trigger point
      for(let i = sections.length - 1; i >= 0; i--){
        const { link, section } = sections[i];
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        // Check if section is in viewport (with some buffer)
        if(triggerPoint >= sectionTop && scrollY < sectionTop + sectionHeight){
          activeLink = link;
          break;
        }
      }
      
      // If no section in view, find the last one we've scrolled past
      if(!activeLink){
        for(let i = sections.length - 1; i >= 0; i--){
          const { link, section } = sections[i];
          const sectionTop = section.offsetTop;
          
          if(triggerPoint >= sectionTop){
            activeLink = link;
            break;
          }
        }
      }
      
      // If we're at the very top, highlight the first section
      if(scrollY < 100 && sections.length > 0){
        activeLink = sections[0].link;
      }
      
      // Only update if the active link has changed to prevent flickering
      if(activeLink !== currentActiveLink){
        currentActiveLink = activeLink;
        setActiveLink(activeLink);
      }
    }
    
    // Use scroll event with requestAnimationFrame for smooth updates
    let ticking = false;
    function handleScroll(){
      if(!ticking){
        window.requestAnimationFrame(() => {
          updateActiveNav();
          ticking = false;
        });
        ticking = true;
      }
    }
    
    // Initial update
    updateActiveNav();
    
    // Listen to scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateActiveNav);
    
    // Handle hash changes
    function handleHashChange(){
      if(location.hash){
        const link = document.querySelector('.nav-links a[href="' + location.hash + '"]');
        if(link) setActiveLink(link);
      } else {
        updateActiveNav();
      }
    }
    
    window.addEventListener('hashchange', handleHashChange);
  }
  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  if(mobileBtn){
    const nav = mobileBtn.closest('nav');
    const menu = document.createElement('div');
    menu.id = 'mobileMenu';
    menu.className = 'mobile-menu';
    menu.setAttribute('aria-hidden', 'true');
    menu.innerHTML = `
      <div class="mobile-menu-inner">
        <button class="mobile-close" aria-label="close menu">×</button>
        <nav class="mobile-links"></nav>
      </div>`;
    document.body.appendChild(menu);
    const links = menu.querySelector('.mobile-links');
    // clone nav items
    const navLinks = nav.querySelector('.nav-links');
    if(navLinks){
      links.appendChild(navLinks.cloneNode(true));
    }
    const navActions = nav.querySelector('.nav-actions');
    if(navActions){
      links.appendChild(navActions.cloneNode(true));
    }
    const navRight = nav.querySelector('.nav-right');
    if(navRight){
      links.appendChild(navRight.cloneNode(true));
    }
    mobileBtn.addEventListener('click', function(){
      const open = mobileBtn.getAttribute('aria-expanded') === 'true';
      mobileBtn.setAttribute('aria-expanded', String(!open));
      menu.setAttribute('aria-hidden', String(open));
      menu.classList.toggle('open', !open);
      if(!open && !reduced){ document.body.classList.add('is-loading'); setTimeout(()=>document.body.classList.remove('is-loading'), 280); }
    });
    // close overlay when clicking links inside mobile menu
    menu.addEventListener('click', function(ev){
      const a = ev.target.closest('a');
      if(a){
        // navigate with fade
        const href = a.getAttribute('href');
        if(href && !href.startsWith('#') && window.location){
          ev.preventDefault();
          if(!reduced){ document.body.classList.add('is-loading'); setTimeout(()=>location.href = href, 340); }
          else { location.href = href; }
        } else {
          // close menu for anchors
          mobileBtn.setAttribute('aria-expanded', 'false');
          menu.setAttribute('aria-hidden', 'true');
          menu.classList.remove('open');
        }
      }
      // close when clicking backdrop
      if(ev.target === menu){
        mobileBtn.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        menu.classList.remove('open');
      }
    });
    // close on ESC
    document.addEventListener('keydown', function(ev){ if(ev.key === 'Escape'){ mobileBtn.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true'); menu.classList.remove('open'); }});
    menu.querySelector('.mobile-close').addEventListener('click', function(){
      mobileBtn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      menu.classList.remove('open');
    });
  }
});
