<template>
  <div class="forgot-page">
    <div class="bg-crosses"></div>
    <div class="bg-shapes"><span></span><span></span></div>

    <div class="card">
      <!-- Header -->
      <div class="card-top">
        <div class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/>
              <path d="M9 12h6M12 9v6"/>
            </svg>
          </div>
          <div class="logo-text">Pharma<span>Scan</span></div>
        </div>

        <div class="icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <h1>{{ titles[currentStep].t }}</h1>
        <p>{{ titles[currentStep].d }}</p>
      </div>

      <div class="card-body">
        <!-- Steps indicator -->
        <div class="steps">
          <div class="step" :class="{ active: currentStep >= 1, done: currentStep > 1 }">
            <div class="step-num">1</div>
            <span class="step-label">Email</span>
          </div>
          <div class="step-line" :class="{ filled: currentStep > 1 }"></div>
          <div class="step" :class="{ active: currentStep >= 2, done: currentStep > 2 }">
            <div class="step-num">2</div>
            <span class="step-label">Code</span>
          </div>
          <div class="step-line" :class="{ filled: currentStep > 2 }"></div>
          <div class="step" :class="{ active: currentStep >= 3 }">
            <div class="step-num">3</div>
            <span class="step-label">Nouveau mot de passe</span>
          </div>
        </div>

        <!-- PANEL 1 : Email -->
        <div v-if="currentStep === 1" class="panel">
          <div class="field">
            <label>Adresse email</label>
            <div class="input-wrap">
              <span class="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input type="email" v-model="resetEmail" placeholder="votre@email.com" autocomplete="email"/>
            </div>
          </div>
          <button class="btn-primary" :class="{ loading: isLoading }" @click="handleSendCode">
            <span class="btn-text">Envoyer le code</span>
            <span class="btn-spinner"><span class="spinner-ring"></span></span>
          </button>
          <router-link to="/auth" class="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Retour à la connexion
          </router-link>
        </div>

        <!-- PANEL 2 : Code OTP -->
        <div v-if="currentStep === 2" class="panel">
          <p class="hint-text" style="text-align:center; margin-bottom:20px;">
            Un code à 6 chiffres a été envoyé à <strong>{{ resetEmail }}</strong>
          </p>
          <div class="otp-wrap">
            <input v-for="(digit, i) in otpDigits" :key="i" v-model="otpDigits[i]" 
              class="otp-input" :class="{ filled: digit }"
              type="text" maxlength="1" inputmode="numeric"
              @input="handleOtpInput(i, $event)"
              @keydown="handleOtpKeydown(i, $event)"
              @paste="handleOtpPaste"
              :ref="el => { if(el) otpRefs[i] = el }"
            />
          </div>
          <div class="resend-row">
            Pas reçu ? 
            <button class="resend-btn" @click="handleResend" :disabled="resendCountdown > 0">
              Renvoyer <span v-if="resendCountdown > 0">({{ resendCountdown }}s)</span>
            </button>
          </div>
          <button class="btn-primary" :class="{ loading: isLoading }" @click="handleVerify">
            <span class="btn-text">Vérifier le code</span>
            <span class="btn-spinner"><span class="spinner-ring"></span></span>
          </button>
          <a href="#" class="back-link" @click.prevent="goToStep(1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Modifier l'email
          </a>
        </div>

        <!-- PANEL 3 : Nouveau mot de passe -->
        <div v-if="currentStep === 3" class="panel">
          <div class="field">
            <label>Nouveau mot de passe</label>
            <div class="input-wrap">
              <span class="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </span>
              <input :type="showNewPw ? 'text' : 'password'" v-model="newPw" placeholder="Min. 8 caractères" @input="checkStrength"/>
              <button class="toggle-pw" type="button" @click="showNewPw = !showNewPw">
                <svg v-if="showNewPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <div class="pw-strength">
              <div class="pw-bar" :class="pwStrengthClass(0)"></div>
              <div class="pw-bar" :class="pwStrengthClass(1)"></div>
              <div class="pw-bar" :class="pwStrengthClass(2)"></div>
              <span class="pw-label">{{ pwLabel }}</span>
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
              <input :type="showConfirmPw ? 'text' : 'password'" v-model="confirmPw" placeholder="Répétez le mot de passe"/>
              <button class="toggle-pw" type="button" @click="showConfirmPw = !showConfirmPw">
                <svg v-if="showConfirmPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>
          <button class="btn-primary" :class="{ loading: isLoading }" @click="handleReset">
            <span class="btn-text">Réinitialiser le mot de passe</span>
            <span class="btn-spinner"><span class="spinner-ring"></span></span>
          </button>
        </div>

        <!-- PANEL 4 : Succès -->
        <div v-if="currentStep === 4" class="panel">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0e6655" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div class="success-title">Mot de passe mis à jour !</div>
          <div class="success-desc">
            Votre mot de passe a été réinitialisé avec succès.<br/>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </div>
          <router-link to="/auth">
            <button class="btn-primary" style="margin-top:0">
              <span class="btn-text">Se connecter</span>
            </button>
          </router-link>
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
import { ref, computed, nextTick } from 'vue'

const currentStep = ref(1)
const isLoading = ref(false)
const resetEmail = ref('')
const otpDigits = ref(['', '', '', '', '', ''])
const otpRefs = ref([])
const resendCountdown = ref(0)
const newPw = ref('')
const confirmPw = ref('')
const showNewPw = ref(false)
const showConfirmPw = ref(false)
const pwScore = ref(0)

const toast = ref({ show: false, message: '', type: '' })

const titles = {
  1: { t: 'Mot de passe oublié', d: 'Entrez votre email pour recevoir un code de vérification.' },
  2: { t: 'Vérification', d: 'Saisissez le code à 6 chiffres envoyé par email.' },
  3: { t: 'Nouveau mot de passe', d: 'Choisissez un mot de passe sécurisé pour votre compte.' },
  4: { t: 'Réinitialisation réussie', d: 'Votre compte est sécurisé.' }
}

const pwLabel = computed(() => {
  const labels = ['Entrez un mot de passe', 'Faible', 'Moyen', 'Fort']
  return labels[pwScore.value] || 'Entrez un mot de passe'
})

function pwStrengthClass(index) {
  const levels = ['weak', 'medium', 'strong']
  if (pwScore.value === 0) return ''
  return index < pwScore.value ? levels[pwScore.value - 1] : ''
}

function showToastMsg(msg, type = '') {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => toast.value.show = false, 3200)
}

function goToStep(step) {
  currentStep.value = step
}

function handleSendCode() {
  const email = resetEmail.value.trim()
  if (!email || !email.includes('@')) {
    showToastMsg('Veuillez entrer un email valide', 'error')
    return
  }
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    goToStep(2)
    startCountdown()
  }, 1600)
}

function startCountdown() {
  resendCountdown.value = 60
  const timer = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0) clearInterval(timer)
  }, 1000)
}

function handleResend() {
  showToastMsg('Code renvoyé !', 'success')
  startCountdown()
}

function handleOtpInput(index, event) {
  const val = event.target.value.replace(/\D/g, '')
  otpDigits.value[index] = val
  if (val && index < 5) {
    nextTick(() => otpRefs.value[index + 1]?.focus())
  }
}

function handleOtpKeydown(index, event) {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpDigits.value[index - 1] = ''
    nextTick(() => otpRefs.value[index - 1]?.focus())
  }
}

function handleOtpPaste(event) {
  const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
  pasted.split('').forEach((char, idx) => {
    if (idx < 6) otpDigits.value[idx] = char
  })
  event.preventDefault()
}

function handleVerify() {
  const code = otpDigits.value.join('')
  if (code.length < 6) {
    showToastMsg('Veuillez saisir les 6 chiffres du code', 'error')
    return
  }
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    goToStep(3)
  }, 1600)
}

function checkStrength() {
  const val = newPw.value
  if (!val) {
    pwScore.value = 0
    return
  }
  let score = 0
  if (val.length >= 8) score++
  if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++
  if (/[^A-Za-z0-9]/.test(val)) score++
  pwScore.value = score
}

function handleReset() {
  const pw = newPw.value
  if (pw.length < 8) {
    showToastMsg('Mot de passe trop court (min. 8 caractères)', 'error')
    return
  }
  if (pw !== confirmPw.value) {
    showToastMsg('Les mots de passe ne correspondent pas', 'error')
    return
  }
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    goToStep(4)
  }, 1600)
}
</script>

<style scoped>
.forgot-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
  background: #f0f4f3;
}

.bg-crosses {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image: radial-gradient(circle, rgba(14,102,85,0.06) 1px, transparent 1px);
  background-size: 32px 32px;
}
.bg-shapes { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.bg-shapes span {
  position: absolute; border-radius: 50%; opacity: 0.18; filter: blur(60px);
  animation: floatShape 12s ease-in-out infinite alternate;
}
.bg-shapes span:nth-child(1) { width: 520px; height: 520px; background: #b8ead9; top: -180px; left: -100px; }
.bg-shapes span:nth-child(2) { width: 380px; height: 380px; background: #0e6655; bottom: -120px; right: -80px; animation-delay: -4s; }
@keyframes floatShape {
  0% { transform: translate(0,0) scale(1); }
  100% { transform: translate(30px,20px) scale(1.06); }
}

.card {
  position: relative; z-index: 1;
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 24px 80px rgba(14, 102, 85, 0.15);
  width: min(460px, 94vw);
  overflow: hidden;
  animation: pageIn 0.7s cubic-bezier(0.23,1,0.32,1) both;
}
@keyframes pageIn {
  from { opacity: 0; transform: translateY(28px) scale(0.98); }
  to   { opacity: 1; transform: none; }
}

.card-top {
  background: linear-gradient(135deg, #1a8870, #0e6655);
  padding: 32px 40px 28px;
  position: relative;
  overflow: hidden;
}
.card-top::before {
  content: ''; position: absolute; top: -50px; right: -50px;
  width: 180px; height: 180px; border-radius: 50%;
  background: rgba(255,255,255,0.07);
}
.card-top::after {
  content: ''; position: absolute; bottom: -60px; left: -30px;
  width: 140px; height: 140px; border-radius: 50%;
  background: rgba(255,255,255,0.04);
}

.logo {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 24px;
}
.logo-icon {
  width: 36px; height: 36px;
  background: rgba(255,255,255,0.15);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.logo-icon svg { width: 18px; height: 18px; }
.logo-text {
  font-family: 'Instrument Serif', serif;
  font-size: 1.35rem;
  color: #fff;
  letter-spacing: -0.02em;
}
.logo-text span { color: #b8ead9; }

.icon-circle {
  width: 56px; height: 56px;
  background: rgba(255,255,255,0.15);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
  position: relative; z-index: 1;
}
.icon-circle svg { width: 28px; height: 28px; }

.card-top h1 {
  font-family: 'Instrument Serif', serif;
  font-size: 1.6rem;
  color: #fff;
  margin-bottom: 6px;
  position: relative; z-index: 1;
}
.card-top p {
  font-size: 0.86rem;
  color: rgba(255,255,255,0.68);
  line-height: 1.55;
  position: relative; z-index: 1;
}

.card-body { padding: 36px 40px 40px; }

/* Steps */
.steps {
  display: flex; align-items: center; gap: 0; margin-bottom: 32px;
}
.step {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}
.step-num {
  width: 26px; height: 26px; border-radius: 50%;
  background: #e8f5f1;
  border: 1.5px solid #d4e8e0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700;
  color: #6b8c82;
  transition: all 0.3s;
}
.step.active .step-num, .step.done .step-num {
  background: #0e6655;
  border-color: #0e6655;
  color: #fff;
}
.step-label {
  font-size: 0.78rem; font-weight: 500;
  color: #6b8c82;
  transition: color 0.3s;
}
.step.active .step-label, .step.done .step-label { color: #0e6655; }
.step-line {
  flex: 1; height: 1.5px;
  background: #d4e8e0;
  margin: 0 8px;
  position: relative;
  overflow: hidden;
}
.step-line::after {
  content: ''; position: absolute; top: 0; left: 0;
  height: 100%; width: 0%;
  background: #0e6655;
  transition: width 0.5s ease;
}
.step-line.filled::after { width: 100%; }

/* Panels */
.field { margin-bottom: 20px; }
.field label {
  display: block;
  font-size: 0.82rem; font-weight: 600;
  color: #1a2b27;
  margin-bottom: 7px;
  letter-spacing: 0.01em;
}
.input-wrap { position: relative; }
.input-wrap .icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: #6b8c82; display: flex; align-items: center;
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

/* OTP inputs */
.otp-wrap {
  display: flex; gap: 10px; justify-content: center;
  margin-bottom: 8px;
}
.otp-input {
  width: 52px; height: 58px;
  border: 1.5px solid #d4e8e0;
  border-radius: 12px;
  background: #f7faf9;
  font-family: 'DM Sans', sans-serif;
  font-size: 1.4rem; font-weight: 700;
  color: #1a2b27;
  text-align: center;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.otp-input:focus {
  border-color: #0e6655;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(14,102,85,0.1);
}
.otp-input.filled {
  border-color: #0e6655;
  background: #e8f5f1;
}

.resend-row {
  text-align: center; margin-bottom: 20px;
  font-size: 0.83rem; color: #6b8c82;
}
.resend-btn {
  background: none; border: none; cursor: pointer;
  color: #0e6655; font-weight: 600; font-family: 'DM Sans', sans-serif;
  font-size: 0.83rem; padding: 0;
  transition: opacity 0.2s;
}
.resend-btn:disabled { opacity: 0.4; cursor: default; }

.toggle-pw {
  position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: #6b8c82;
  display: flex; align-items: center; padding: 2px;
}
.toggle-pw svg { width: 16px; height: 16px; }

.pw-strength {
  margin-top: 8px;
  display: flex; gap: 5px; align-items: center;
}
.pw-bar {
  flex: 1; height: 3px; border-radius: 99px;
  background: #d4e8e0; transition: background 0.3s;
}
.pw-bar.weak { background: #e74c3c; }
.pw-bar.medium { background: #f39c12; }
.pw-bar.strong { background: #0e6655; }
.pw-label { font-size: 0.75rem; color: #6b8c82; white-space: nowrap; }

.hint-text {
  font-size: 0.8rem; color: #6b8c82;
  margin-top: 6px; line-height: 1.4;
}

.btn-primary {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #1a8870 0%, #0e6655 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem; font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 18px rgba(14,102,85,0.3);
  position: relative; overflow: hidden;
  margin-top: 4px;
}
.btn-primary::after {
  content: ''; position: absolute; inset: 0;
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

.back-link {
  display: flex; align-items: center; justify-content: center;
  gap: 6px; margin-top: 20px;
  font-size: 0.84rem; color: #6b8c82;
  text-decoration: none;
  transition: color 0.2s;
}
.back-link:hover { color: #0e6655; }
.back-link svg { width: 14px; height: 14px; }

/* Success state */
.success-icon {
  width: 72px; height: 72px;
  background: #e8f5f1;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
}
.success-icon svg { width: 36px; height: 36px; }
.success-title {
  font-family: 'Instrument Serif', serif;
  font-size: 1.55rem; color: #1a2b27;
  text-align: center; margin-bottom: 10px;
}
.success-desc {
  font-size: 0.87rem; color: #6b8c82;
  text-align: center; line-height: 1.6; margin-bottom: 28px;
}

/* Toast */
.toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px);
  background: #1a2b27; color: #fff;
  padding: 12px 24px; border-radius: 50px;
  font-size: 0.88rem; font-weight: 500;
  opacity: 0; transition: all 0.35s cubic-bezier(0.23,1,0.32,1);
  pointer-events: none; z-index: 100; white-space: nowrap;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
.toast.success { background: #0e6655; }
.toast.error { background: #c0392b; }

@media (max-width: 480px) {
  .card-top, .card-body { padding-left: 24px; padding-right: 24px; }
  .otp-input { width: 44px; height: 50px; font-size: 1.2rem; }
}
</style>
