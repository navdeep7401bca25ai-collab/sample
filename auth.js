// Simple front-end auth handling using localStorage (for demo only)
(function(){
  function saveUser(user){
    const users = JSON.parse(localStorage.getItem('acme_users') || '{}');
    users[user.email] = {name:user.name, company:user.company || '', password:user.password, plan:user.plan || 'basic'};
    localStorage.setItem('acme_users', JSON.stringify(users));
  }

  function getUser(email){
    const users = JSON.parse(localStorage.getItem('acme_users') || '{}');
    return users[email];
  }

  // Registration
  const registerForm = document.getElementById('registerForm');
  if(registerForm){
    registerForm.addEventListener('submit', function(e){
      e.preventDefault();
      const name = registerForm.name.value.trim();
      const company = registerForm.company.value.trim();
      const email = registerForm.email.value.trim().toLowerCase();
      const password = registerForm.password.value;
      const plan = registerForm.plan.value;

      if(getUser(email)){
        alert('A user with this email already exists. Please login instead.');
        window.location = 'login.html';
        return;
      }

      saveUser({name,company,email,password,plan});

      alert('Account created successfully. You will be redirected to login.');
      window.location = 'login.html';
    });
  }

  // Login
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', function(e){
      e.preventDefault();
      const email = loginForm.email.value.trim().toLowerCase();
      const password = loginForm.password.value;
      const user = getUser(email);
      if(!user || user.password !== password){
        alert('Invalid email or password.');
        return;
      }
      // Save session token (simple) and redirect
      localStorage.setItem('acme_session', JSON.stringify({email:email, name:user.name}));
      alert('Login successful. Redirecting to Home.');
      window.location = 'index.html';
    });
  }

  // If the page has a logout button, handle it
  const logout = document.getElementById('logoutBtn');
  if(logout){
    logout.addEventListener('click', function(){
      localStorage.removeItem('acme_session');
      window.location.reload();
    });
  }

  // Display user info in nav
  function renderUserMenu(){
    const userMenu = document.getElementById('userMenu');
    if(!userMenu) return;
    const session = JSON.parse(localStorage.getItem('acme_session') || 'null');
    if(session && session.email){
      const initials = (session.name || '').split(' ').filter(Boolean).map(n=>n[0]).slice(0,2).join('').toUpperCase() || 'U';
      userMenu.innerHTML = ` <span class=\"nav-user\"> <span class=\"avatar\" aria-hidden=\"true\">${initials}</span> Hello, ${session.name}</span> <button id=\"logoutBtn\" class=\"btn\" aria-label=\"Logout\" title=\"Logout\">Logout</button>`;
    } else {
      // remove static login/register display -- nothing to show for visitors
      userMenu.innerHTML = '';
      const btn = document.getElementById('logoutBtn');
      if(btn) btn.addEventListener('click', function(){
        localStorage.removeItem('acme_session');
        window.location.reload();
      });
    }
  }
  renderUserMenu();
})();
