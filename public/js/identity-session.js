// Shared Netlify Identity session helpers to keep auth behavior consistent across pages.
(function attachIdentitySession(global) {
  const SIGNED_OUT_KEY = 'brightbridge_signed_out';

  function getIdentity() {
    return global.netlifyIdentity || null;
  }

  function initIdentity() {
    const identity = getIdentity();
    if (!identity || typeof identity.init !== 'function') {
      return null;
    }

    const apiUrl = `${global.location.origin}/.netlify/identity`;
    identity.init({ APIUrl: apiUrl });
    return identity;
  }

  function clearSignedOutLock() {
    global.sessionStorage.removeItem(SIGNED_OUT_KEY);
    global.localStorage.removeItem(SIGNED_OUT_KEY);
  }

  function setSignedOutLock() {
    // Keep lock scoped to this browser session so auto-login can resume later.
    global.sessionStorage.setItem(SIGNED_OUT_KEY, 'true');
    global.localStorage.removeItem(SIGNED_OUT_KEY);
  }

  function hasSignedOutLock() {
    const sessionLocked = global.sessionStorage.getItem(SIGNED_OUT_KEY) === 'true';
    const legacyLocalLocked = global.localStorage.getItem(SIGNED_OUT_KEY) === 'true';

    if (sessionLocked) {
      return true;
    }

    if (legacyLocalLocked) {
      global.sessionStorage.setItem(SIGNED_OUT_KEY, 'true');
      global.localStorage.removeItem(SIGNED_OUT_KEY);
      return true;
    }

    return false;
  }

  function getCurrentUser() {
    const identity = getIdentity();
    if (!identity || typeof identity.currentUser !== 'function') {
      return null;
    }

    return identity.currentUser();
  }

  function canAutoResumeSession() {
    return !!getCurrentUser() && !hasSignedOutLock();
  }

  function logoutAndRedirect(redirectPath) {
    const redirectTo = () => {
      global.location.assign(redirectPath || '/test/login.html');
    };

    setSignedOutLock();

    const identity = getIdentity();
    if (!identity || typeof identity.logout !== 'function') {
      redirectTo();
      return;
    }

    let redirected = false;
    const safeRedirect = () => {
      if (redirected) {
        return;
      }

      redirected = true;
      redirectTo();
    };

    if (typeof identity.on === 'function') {
      identity.on('logout', safeRedirect);
    }

    const result = identity.logout();
    if (result && typeof result.then === 'function') {
      result.then(safeRedirect).catch(safeRedirect);
    }

    global.setTimeout(safeRedirect, 1500);
  }

  global.IdentitySession = {
    initIdentity,
    clearSignedOutLock,
    setSignedOutLock,
    hasSignedOutLock,
    getCurrentUser,
    canAutoResumeSession,
    logoutAndRedirect
  };
})(window);