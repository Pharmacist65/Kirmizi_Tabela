export function AnimatedPharmacySign() {
  return (
    <div className="animated-sign" aria-label="Eczane tabela animasyonu">
      <div className="sign-wall">
        <div className="red-band left" />
        <div className="red-band right" />
        <div className="center-box">
          <div className="blank-sign-face" aria-hidden="true">
            <span>ECZANE</span>
          </div>
        </div>
        <div className="blade-sign-mount" aria-hidden="true">
          <div className="neon-e-logo">
            <span>E</span>
          </div>
        </div>
      </div>
      <div className="sign-caption">
        <strong>Tabelayı taktın.</strong>
        <span>Şimdi mesele ışığı yakmak değil, kasayı ve vade gününü aynı anda yönetmek.</span>
      </div>
    </div>
  );
}
