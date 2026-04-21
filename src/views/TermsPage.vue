<template>
  <div class="terms-page">
    <header class="header">
      <div class="logo">PharmaScan</div>
      <router-link to="/auth" class="back-btn">← Retour</router-link>
    </header>

    <div class="container">
      <div class="card">
        <h1>Conditions d'utilisation</h1>

        <div class="highlight">
          En utilisant PharmaScan, vous acceptez les présentes conditions. Merci de les lire attentivement.
        </div>

        <div class="section">
          <h2>1. Objet</h2>
          <p>Ces conditions définissent les règles d'utilisation de la plateforme PharmaScan.</p>
        </div>

        <div class="section">
          <h2>2. Accès au service</h2>
          <p>L'application est destinée aux professionnels de santé disposant d'un compte valide.</p>
        </div>

        <div class="section">
          <h2>3. Compte utilisateur</h2>
          <ul>
            <li>Vous devez fournir des informations exactes</li>
            <li>Vous êtes responsable de vos identifiants</li>
            <li>Ne partagez pas votre compte</li>
          </ul>
        </div>

        <div class="section">
          <h2>4. Utilisation</h2>
          <p>Vous vous engagez à utiliser l'application de manière légale et conforme à sa finalité.</p>
        </div>

        <div class="section">
          <h2>5. Services</h2>
          <p>PharmaScan fournit des informations sur les médicaments et les pharmacies à proximité.</p>
        </div>

        <div class="section">
          <h2>6. Responsabilité</h2>
          <p>Les informations sont fournies à titre indicatif. PharmaScan ne garantit pas leur exactitude en temps réel.</p>
        </div>

        <div class="section">
          <h2>7. Données personnelles</h2>
          <p>Vos données sont traitées conformément à notre politique de confidentialité.</p>
        </div>

        <div class="section">
          <h2>8. Suspension</h2>
          <p>Nous pouvons suspendre un compte en cas de non-respect des conditions.</p>
        </div>

        <div class="section">
          <h2>9. Propriété</h2>
          <p>Tous les contenus de PharmaScan sont protégés et ne peuvent être utilisés sans autorisation.</p>
        </div>

        <div class="section">
          <h2>10. Modification</h2>
          <p>Ces conditions peuvent être modifiées à tout moment.</p>
        </div>

        <div class="section">
          <h2>11. Contact</h2>
          <p>Email : support@pharmascan.com</p>
        </div>

        <div class="footer">
          © 2026 PharmaScan — La pharmacie, réinventée.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.terms-page {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #e8efed, #f4f7f6);
  color: #222;
  min-height: 100vh;
}

.header {
  background: #0f5c4c;
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-weight: 600;
  font-size: 20px;
}

.back-btn {
  background: rgba(255,255,255,0.15);
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  color: white;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: rgba(255,255,255,0.25);
}

.container {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
}

h1 {
  color: #0f5c4c;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 13px;
  color: #777;
  margin-bottom: 30px;
}

.section {
  margin-bottom: 25px;
}

.section h2 {
  font-size: 16px;
  margin-bottom: 8px;
  color: #0f5c4c;
}

.section p, .section li {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

ul {
  padding-left: 18px;
}

.footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 13px;
  color: #888;
  text-align: center;
}

.highlight {
  background: #eef6f4;
  padding: 15px;
  border-left: 4px solid #0f5c4c;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

@media(max-width: 600px) {
  .card {
    padding: 25px;
  }
  .header {
    padding: 15px 20px;
  }
}
</style>
