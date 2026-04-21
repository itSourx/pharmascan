<template>
  <div class="auth-page">
    <div class="bg-crosses"></div>
    <div class="bg-shapes">
      <span></span><span></span><span></span>
    </div>

    <div class="wrapper">
      <!-- LEFT PANEL -->
      <div class="left-panel">
        <div class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/>
              <path d="M9 12h6M12 9v6"/>
            </svg>
          </div>
          <div class="logo-text">Pharma<span>Scan</span></div>
        </div>

        <div class="left-content">
          <div class="left-tagline">
            La pharmacie,<br/>
            <strong>réinventée.</strong>
          </div>
          <div class="left-desc">
            Scannez, gérez et dispensez vos médicaments avec précision et sécurité. La plateforme numérique de référence pour les professionnels de santé.
          </div>
        </div>

        <div class="left-features">
          <div class="feature-item">
            <div class="feature-dot">
              <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2" stroke-linecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8M12 8v8"/>
              </svg>
            </div>
            <span class="feature-text">Scan de codes-barres & QR codes médicaments</span>
          </div>
          <div class="feature-item">
            <div class="feature-dot">
              <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2" stroke-linecap="round">
                <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>
              </svg>
            </div>
            <span class="feature-text">Vérification automatique des interactions</span>
          </div>
          <div class="feature-item">
            <div class="feature-dot">
              <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2" stroke-linecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/>
              </svg>
            </div>
            <span class="feature-text">Gestion de stock en temps réel</span>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL -->
      <div class="right-panel">
        <div class="tabs">
          <button class="tab-btn" :class="{ active: activeTab === 'login' }" @click="switchTab('login')">Connexion</button>
          <button class="tab-btn" :class="{ active: activeTab === 'register' }" @click="switchTab('register')">Inscription</button>
        </div>

        <div class="form-wrapper">
          <!-- LOGIN FORM -->
          <div v-if="activeTab === 'login'" class="form-view">
            <div class="form-title">Bon retour 👋</div>
            <div class="form-subtitle">Connectez-vous à votre espace PharmaScan</div>

            <div class="field">
              <label>Adresse email</label>
              <div class="input-wrap">
                <span class="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input type="email" v-model="loginEmail" placeholder="votre@email.com" autocomplete="email"/>
              </div>
            </div>

            <div class="field">
              <label>Mot de passe</label>
              <div class="input-wrap">
                <span class="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </span>
                <input :type="showLoginPw ? 'text' : 'password'" v-model="loginPassword" placeholder="••••••••"/>
                <button class="toggle-pw" type="button" @click="showLoginPw = !showLoginPw">
                  <svg v-if="showLoginPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="options-row">
              <label class="checkbox-label">
                <input type="checkbox" v-model="rememberMe"/>
                <span class="custom-check">
                  <svg viewBox="0 0 12 10" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="1,5 4.5,8.5 11,1"/>
                  </svg>
                </span>
                Se souvenir de moi
              </label>
              <router-link to="/forgot-password" class="forgot-link">Mot de passe oublié ?</router-link>
            </div>

            <button class="btn-primary" :class="{ loading: isLoading }" @click="handleLogin">
              <span class="btn-text">Se connecter</span>
              <span class="btn-spinner"><span class="spinner-ring"></span></span>
            </button>
          </div>

          <!-- REGISTER FORM -->
          <div v-if="activeTab === 'register'" class="form-view">
            <div class="form-title">Créer un compte</div>

            <div class="row-2">
              <div class="field">
                <label>Prénom</label>
                <div class="input-wrap">
                  <span class="icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input type="text" v-model="regFirstName" placeholder="Jean" autocomplete="given-name"/>
                </div>
              </div>
              <div class="field">
                <label>Nom</label>
                <div class="input-wrap">
                  <span class="icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input type="text" v-model="regLastName" placeholder="Dupont" autocomplete="family-name"/>
                </div>
              </div>
            </div>

            <div class="field">
              <label>Adresse email professionnelle</label>
              <div class="input-wrap">
                <span class="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input type="email" v-model="regEmail" placeholder="pro@pharmacie.fr" autocomplete="email"/>
              </div>
            </div>

            <div class="field">
              <label>Téléphone professionnel</label>
              <div class="input-wrap">
                <span class="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                </span>
                <input type="tel" v-model="regPhone" placeholder="+33 6 12 34 56 78" autocomplete="tel"/>
              </div>
            </div>

            <div class="field">
              <label>Mot de passe</label>
              <div class="input-wrap">
                <span class="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </span>
                <input :type="showRegPw ? 'text' : 'password'" v-model="regPassword" placeholder="Min. 8 caractères" @input="validatePw"/>
                <button class="toggle-pw" type="button" @click="showRegPw = !showRegPw">
                  <svg v-if="showRegPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <div class="field-hint" :class="{ visible: pwHint, 'hint-error': !pwValid, 'hint-ok': pwValid }">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path v-if="pwValid" d="M20 6L9 17l-5-5"/>
                  <g v-else><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></g>
                </svg>
                <span>{{ pwHintText }}</span>
              </div>
            </div>

            <div class="field">
              <label>Confirmer le mot de passe</label>
              <div class="input-wrap">
                <span class="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </span>
                <input :type="showRegPwConfirm ? 'text' : 'password'" v-model="regPasswordConfirm" placeholder="Répétez votre mot de passe" @input="validatePwConfirm"/>
                <button class="toggle-pw" type="button" @click="showRegPwConfirm = !showRegPwConfirm">
                  <svg v-if="showRegPwConfirm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <div class="field-hint" :class="{ visible: pwConfirmHint, 'hint-error': !pwConfirmMatch, 'hint-ok': pwConfirmMatch }">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path v-if="pwConfirmMatch" d="M20 6L9 17l-5-5"/>
                  <g v-else><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></g>
                </svg>
                <span>{{ pwConfirmHintText }}</span>
              </div>
            </div>

            <button class="btn-primary" :class="{ loading: isLoading }" @click="handleRegister">
              <span class="btn-text">Créer mon compte</span>
              <span class="btn-spinner"><span class="spinner-ring"></span></span>
            </button>

            <p class="terms-text">
              En créant un compte, vous acceptez nos <router-link to="/conditions">Conditions d'utilisation</router-link> et notre <router-link to="/politique">Politique de confidentialité</router-link>.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" :class="{ show: toast.show, success: toast.type === 'success', error: toast.type === 'error' }">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeTab = ref('login')
const isLoading = ref(false)

// Login
const loginEmail = ref('')
const loginPassword = ref('')
const showLoginPw = ref(false)
const rememberMe = ref(false)

// Register
const regFirstName = ref('')
const regLastName = ref('')
const regEmail = ref('')
const regPhone = ref('')
const regPassword = ref('')
const regPasswordConfirm = ref('')
const showRegPw = ref(false)
const showRegPwConfirm = ref(false)

// Validation
const pwHint = ref(false)
const pwValid = ref(false)
const pwHintText = ref('')
const pwConfirmHint = ref(false)
const pwConfirmMatch = ref(false)
const pwConfirmHintText = ref('')

// Toast
const toast = ref({ show: false, message: '', type: '' })

function switchTab(tab) {
  activeTab.value = tab
}

function showToastMsg(msg, type = '') {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => toast.value.show = false, 3200)
}

function validatePw() {
  const val = regPassword.value
  if (!val) {
    pwHint.value = false
    return
  }
  pwHint.value = true
  const ok = val.length >= 8
  pwValid.value = ok
  pwHintText.value = ok ? 'Longueur suffisante' : 'Minimum 8 caractères requis'
  validatePwConfirm()
}

function validatePwConfirm() {
  const pw = regPassword.value
  const confirm = regPasswordConfirm.value
  if (!confirm) {
    pwConfirmHint.value = false
    return
  }
  pwConfirmHint.value = true
  const match = pw === confirm
  pwConfirmMatch.value = match
  pwConfirmHintText.value = match ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'
}

function handleLogin() {
  if (!loginEmail.value || !loginEmail.value.includes('@')) {
    showToastMsg('Veuillez entrer un email valide', 'error')
    return
  }
  if (!loginPassword.value) {
    showToastMsg('Veuillez entrer votre mot de passe', 'error')
    return
  }
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    showToastMsg('Connexion réussie !', 'success')
    router.push('/')
  }, 1600)
}

function handleRegister() {
  if (!regFirstName.value || !regLastName.value) {
    showToastMsg('Veuillez entrer votre prénom et nom', 'error')
    return
  }
  if (!regEmail.value || !regEmail.value.includes('@')) {
    showToastMsg('Veuillez entrer un email valide', 'error')
    return
  }
  if (regPassword.value.length < 8) {
    showToastMsg('Le mot de passe doit contenir au moins 8 caractères', 'error')
    return
  }
  if (regPassword.value !== regPasswordConfirm.value) {
    showToastMsg('Les mots de passe ne correspondent pas', 'error')
    return
  }
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    showToastMsg('Compte créé avec succès !', 'success')
    activeTab.value = 'login'
  }, 1600)
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
  background: #f0f4f3;
}

.bg-shapes {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  overflow: hidden;
}
.bg-shapes span {
  position: absolute;
  border-radius: 50%;
  opacity: 0.18;
  filter: blur(60px);
  animation: floatShape 12s ease-in-out infinite alternate;
}
.bg-shapes span:nth-child(1) {
  width: 520px; height: 520px; background: #b8ead9;
  top: -180px; left: -100px; animation-delay: 0s;
}
.bg-shapes span:nth-child(2) {
  width: 380px; height: 380px; background: #0e6655;
  bottom: -120px; right: -80px; animation-delay: -4s;
}
.bg-shapes span:nth-child(3) {
  width: 220px; height: 220px; background: #a8dfd0;
  top: 40%; left: 60%; animation-delay: -7s;
}
@keyframes floatShape {
  0% { transform: translate(0,0) scale(1); }
  100% { transform: translate(30px, 20px) scale(1.06); }
}

.bg-crosses {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image: radial-gradient(circle, rgba(14,102,85,0.06) 1px, transparent 1px);
  background-size: 32px 32px;
}

.wrapper {
  position: relative; z-index: 1;
  display: flex;
  width: min(960px, 96vw);
  min-height: 580px;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(14, 102, 85, 0.18);
  animation: pageIn 0.7s cubic-bezier(0.23,1,0.32,1) both;
}
@keyframes pageIn {
  from { opacity: 0; transform: translateY(28px) scale(0.98); }
  to   { opacity: 1; transform: none; }
}

/* Left panel */
.left-panel {
  flex: 0 0 42%;
  background: linear-gradient(155deg, #0e6655 0%, #0a4d40 100%);
  padding: 56px 44px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}
.left-panel::before {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 280px; height: 280px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
}
.left-panel::after {
  content: '';
  position: absolute;
  bottom: -80px; left: -40px;
  width: 220px; height: 220px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
}
.logo {
  display: flex; align-items: center; gap: 12px;
}
.logo-icon {
  width: 42px; height: 42px;
  background: rgba(255,255,255,0.15);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
}
.logo-icon svg { width: 22px; height: 22px; }
.logo-text {
  font-family: 'Instrument Serif', serif;
  font-size: 1.6rem;
  color: #fff;
  letter-spacing: -0.02em;
}
.logo-text span { color: #b8ead9; }

.left-content { position: relative; z-index: 1; }
.left-tagline {
  font-family: 'Instrument Serif', serif;
  font-size: 2.1rem;
  line-height: 1.25;
  color: #fff;
  margin-bottom: 18px;
  font-style: italic;
}
.left-tagline strong { font-style: normal; display: block; }
.left-desc {
  font-size: 0.92rem;
  color: rgba(255,255,255,0.65);
  line-height: 1.65;
}

.left-features {
  display: flex; flex-direction: column; gap: 14px;
  position: relative; z-index: 1;
}
.feature-item {
  display: flex; align-items: center; gap: 12px;
}
.feature-dot {
  width: 32px; height: 32px; border-radius: 9px;
  background: rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.feature-dot svg { width: 16px; height: 16px; }
.feature-text { font-size: 0.86rem; color: rgba(255,255,255,0.75); }

/* Right panel */
.right-panel {
  flex: 1;
  background: #fff;
  padding: 40px 52px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0;
  background: #e8f5f1;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 28px;
  width: fit-content;
}
.tab-btn {
  padding: 9px 28px;
  border: none;
  background: transparent;
  border-radius: 9px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  font-weight: 500;
  color: #6b8c82;
  cursor: pointer;
  transition: all 0.25s ease;
}
.tab-btn.active {
  background: #0e6655;
  color: #fff;
  box-shadow: 0 2px 10px rgba(14,102,85,0.28);
}

/* Forms */
.form-title {
  font-family: 'Instrument Serif', serif;
  font-size: 1.7rem;
  color: #1a2b27;
  margin-bottom: 6px;
}
.form-subtitle {
  font-size: 0.87rem;
  color: #6b8c82;
  margin-bottom: 22px;
  line-height: 1.5;
}

.field { margin-bottom: 14px; }
.field label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #1a2b27;
  margin-bottom: 7px;
  letter-spacing: 0.01em;
}
.input-wrap {
  position: relative;
}
.input-wrap .icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: #6b8c82;
  display: flex; align-items: center;
}
.input-wrap .icon svg { width: 16px; height: 16px; }
.input-wrap input {
  width: 100%;
  padding: 11px 14px 11px 40px;
  border: 1.5px solid #d4e8e0;
  border-radius: 11px;
  background: #f7faf9;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.91rem;
  color: #1a2b27;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  outline: none;
}
.input-wrap input:focus {
  border-color: #0e6655;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(14,102,85,0.1);
}
.input-wrap input::placeholder { color: #a8c0b8; }

.toggle-pw {
  position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: #6b8c82;
  display: flex; align-items: center; padding: 2px;
}
.toggle-pw svg { width: 16px; height: 16px; }

.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.options-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 22px; margin-top: -4px;
}
.checkbox-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.83rem; color: #6b8c82; cursor: pointer;
}
.checkbox-label input[type=checkbox] { display: none; }
.custom-check {
  width: 17px; height: 17px;
  border: 1.5px solid #d4e8e0;
  border-radius: 5px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.checkbox-label input:checked + .custom-check {
  background: #0e6655;
  border-color: #0e6655;
}
.custom-check svg { display: none; width: 12px; height: 12px; }
.checkbox-label input:checked + .custom-check svg { display: block; }
.forgot-link {
  font-size: 0.83rem; color: #0e6655; text-decoration: none; font-weight: 500;
}
.forgot-link:hover { text-decoration: underline; }

.btn-primary {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #1a8870 0%, #0e6655 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 18px rgba(14,102,85,0.3);
  position: relative;
  overflow: hidden;
  margin-top: 4px;
}
.btn-primary::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(rgba(255,255,255,0.08), transparent);
  border-radius: inherit;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(14,102,85,0.38); }
.btn-primary:active { transform: translateY(0); }
.btn-primary.loading { pointer-events: none; }
.btn-primary .btn-text { transition: opacity 0.2s; }
.btn-primary.loading .btn-text { opacity: 0; }
.btn-spinner {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s;
}
.btn-primary.loading .btn-spinner { opacity: 1; }
.spinner-ring {
  width: 20px; height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.terms-text {
  font-size: 0.78rem; color: #6b8c82;
  text-align: center; margin-top: 14px; line-height: 1.5;
}
.terms-text a { color: #0e6655; text-decoration: none; }
.terms-text a:hover { text-decoration: underline; }

/* Validation states */
.field-hint {
  display: none;
  align-items: center;
  gap: 5px;
  font-size: 0.77rem;
  margin-top: 5px;
}
.field-hint.visible { display: flex; }
.field-hint.hint-error { color: #c0392b; }
.field-hint.hint-ok { color: #27ae60; }
.field-hint svg { width: 12px; height: 12px; flex-shrink: 0; }

/* Toast */
.toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px);
  background: #1a2b27; color: #fff;
  padding: 12px 24px; border-radius: 50px;
  font-size: 0.88rem; font-weight: 500;
  opacity: 0; transition: all 0.35s cubic-bezier(0.23,1,0.32,1);
  pointer-events: none; z-index: 100; white-space: nowrap;
  display: flex; align-items: center; gap: 8px;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
.toast.success { background: #0e6655; }
.toast.error { background: #c0392b; }

@media (max-width: 720px) {
  .left-panel { display: none; }
  .right-panel { padding: 36px 24px; }
  .wrapper { width: 100vw; min-height: 100vh; border-radius: 0; }
}
</style>
