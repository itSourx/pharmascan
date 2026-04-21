<template>
  <div class="privacy-page">
    <header class="header">
      <div class="logo">PharmaScan</div>
      <router-link to="/auth" class="back-btn">← Retour</router-link>
    </header>

    <div class="container">
      <div class="card">
        <h1>Politique de confidentialité</h1>

        <div class="highlight">
          Nous accordons une importance particulière à la protection de vos données personnelles.
        </div>

        <div class="section">
          <h2>1. Données collectées</h2>
          <ul>
            <li>Adresse e-mail</li>
            <li>Mot de passe (sécurisé et chiffré)</li>
            <li>Données de localisation</li>
          </ul>
        </div>

        <div class="section">
          <h2>2. Finalités</h2>
          <p>Les données collectées permettent de créer votre compte, améliorer votre expérience et fournir des services basés sur votre localisation.</p>
        </div>

        <div class="section">
          <h2>3. Localisation</h2>
          <p>Votre position est utilisée pour vous proposer des pharmacies proches et des informations pertinentes. Elle est collectée uniquement avec votre consentement et peut être désactivée à tout moment.</p>
        </div>

        <div class="section">
          <h2>4. Sécurité</h2>
          <p>Nous utilisons des protocoles sécurisés (HTTPS) ainsi que des techniques de chiffrement pour protéger vos données.</p>
        </div>

        <div class="section">
          <h2>5. Partage des données</h2>
          <p>Vos données ne sont jamais vendues. Elles peuvent être partagées uniquement avec des services techniques nécessaires au fonctionnement de l'application.</p>
        </div>

        <div class="section">
          <h2>6. Conservation</h2>
          <p>Vos données sont conservées tant que votre compte est actif ou jusqu'à votre demande de suppression.</p>
        </div>

        <div class="section">
          <h2>7. Vos droits</h2>
          <p>Vous pouvez accéder, modifier ou supprimer vos données à tout moment et retirer votre consentement.</p>
        </div>

        <div class="section">
          <h2>8. Modification</h2>
          <p>Cette politique peut être mise à jour à tout moment.</p>
        </div>

        <div class="section">
          <h2>9. Contact</h2>
          <p>Email : support@pharmascan.com</p>
        </div>

        <div class="footer">
          © 2026 PharmaScan — Données protégées, confiance assurée.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.privacy-page {
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
