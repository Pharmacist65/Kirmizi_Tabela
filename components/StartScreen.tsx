"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Building2, Landmark, MapPin, Store, TrendingUp, WalletCards } from "lucide-react";
import { AnimatedPharmacySign } from "@/components/AnimatedPharmacySign";
import { cityDistricts, getDistrictProfile, locationTypeLabels, locationTypeModifiers, locationTypeOptions } from "@/data/locations";
import { scenarioTemplates } from "@/data/scenarios";
import { formatMoney } from "@/game/engine";
import type { GameStartMode, LocationType, ScenarioTemplate, StartProfile } from "@/game/types";

type StartScreenProps = {
  onStart: (scenarioId: string, profile: StartProfile) => void;
};

const startModeLabels: Record<GameStartMode, string> = {
  new: "Sıfırdan eczane aç",
  takeover: "Mevcut eczaneyi devral",
  crisis: "12 aylık kriz/kurtarma"
};

const startModeDescriptions: Record<GameStartMode, string> = {
  new: "Sıfırdan açılışta önce kurulum görevleri gelir; satış/depo/SGK/POS açılış gününe kadar kilitli kalır.",
  takeover: "Devralmada kurulum hazırdır; borç, stok, personel ve SGK baskısıyla doğrudan günlük oyuna girersin.",
  crisis: "Kriz modunda hazır eczane gelir ama hedefler sertleşir; 12 ayda borç, stok ve memnuniyeti toparlaman gerekir."
};

function getScenariosForMode(mode: GameStartMode) {
  if (mode === "new") return scenarioTemplates.filter((scenario) => scenario.startMode === "new");
  if (mode === "takeover") return scenarioTemplates.filter((scenario) => scenario.startMode === "takeover");
  return scenarioTemplates;
}

function scenarioModeLabel(mode: GameStartMode, scenario: ScenarioTemplate) {
  if (mode === "crisis") return "Kriz/kurtarma";
  return scenario.startMode === "new" ? "Sıfırdan kur" : "Devral";
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [pharmacistName, setPharmacistName] = useState("Ecz. Ayşe Demir");
  const [pharmacyName, setPharmacyName] = useState("Gültepe Merkez Eczanesi");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("Kadıköy");
  const [locationType, setLocationType] = useState<LocationType>("neighborhood");
  const [startMode, setStartMode] = useState<GameStartMode>("new");
  const [selectedScenarioId, setSelectedScenarioId] = useState("new-neighborhood-balanced");
  const districts = cityDistricts[city] ?? [];
  const districtProfile = getDistrictProfile(city, district);
  const modifier = locationTypeModifiers[locationType];
  const estimatedRent = Math.round(Math.max(18000, districtProfile.rentIndex * 720 * modifier.rent) / 100) * 100;
  const visibleScenarios = getScenariosForMode(startMode);
  const selectedScenario =
    visibleScenarios.find((scenario) => scenario.id === selectedScenarioId) ?? visibleScenarios[0] ?? scenarioTemplates[0];

  const handleCity = (nextCity: string) => {
    setCity(nextCity);
    setDistrict(cityDistricts[nextCity]?.[0]?.district ?? "");
  };

  const handleStartMode = (nextMode: GameStartMode) => {
    const firstScenario = getScenariosForMode(nextMode)[0] ?? scenarioTemplates[0];
    setStartMode(nextMode);
    setSelectedScenarioId(firstScenario.id);
    setLocationType(firstScenario.locationType);
  };

  const pickScenario = (scenario: ScenarioTemplate) => {
    setSelectedScenarioId(scenario.id);
    setLocationType(scenario.locationType);
  };

  const start = () => {
    onStart(selectedScenario.id, {
      pharmacistName,
      pharmacyName,
      city,
      district,
      locationType,
      startMode
    });
  };

  const submitStart = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    start();
  };

  return (
    <main className="start-screen">
      <section className="start-hero">
        <div className="start-copy">
          <div className="brand big">
            <div className="brand-mark">
              <Store size={28} aria-hidden="true" />
            </div>
            <div>
              <h1>Kırmızı Tabela</h1>
              <p>Eczane kariyer simülasyonu</p>
            </div>
          </div>
          <h2>Önce eczacıyı ve dükkânı kur, sonra günü oynat.</h2>
          <p>
            Sıfırdan açılışta satış modülleri kilitli başlar. Devralmada ise hazır müşteri, borç,
            POS ve SGK alacağıyla doğrudan krizin içine girersin.
          </p>
          <div className="start-points">
            <span>08:30-19:00 gün akışı</span>
            <span>Kimlikli puan tablosu</span>
            <span>Kurulumdan satışa geçiş</span>
          </div>
        </div>
        <AnimatedPharmacySign />
      </section>

      <section className="setup-grid">
        <form className="setup-form-panel" onSubmit={submitStart}>
          <div className="scenario-heading">
            <div>
              <h2>Oyuncu ve Eczane</h2>
              <p>Bu bilgiler lig tablosunda ve senaryo kimliğinde görünecek.</p>
            </div>
            <TrendingUp size={22} aria-hidden="true" />
          </div>

          <div className="setup-form">
            <label>
              <span>Eczacı adı</span>
              <input value={pharmacistName} onChange={(event) => setPharmacistName(event.target.value)} />
            </label>
            <label>
              <span>Eczane adı</span>
              <input value={pharmacyName} onChange={(event) => setPharmacyName(event.target.value)} />
            </label>
            <label>
              <span>İl</span>
              <select value={city} onChange={(event) => handleCity(event.target.value)}>
                {Object.keys(cityDistricts).map((item) => (
                  <option value={item} key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              <span>İlçe</span>
              <select value={district} onChange={(event) => setDistrict(event.target.value)}>
                {districts.map((item) => (
                  <option value={item.district} key={item.district}>{item.district}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Lokasyon tipi</span>
              <select value={locationType} onChange={(event) => setLocationType(event.target.value as LocationType)}>
                {locationTypeOptions.map((item) => (
                  <option value={item} key={item}>{locationTypeLabels[item]}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Başlangıç tipi</span>
              <select value={startMode} onChange={(event) => handleStartMode(event.target.value as GameStartMode)}>
                {Object.entries(startModeLabels).map(([value, label]) => (
                  <option value={value} key={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>

          <button className="primary-button setup-start-button" type="submit">
            Oyunu kur ve başlat
          </button>
        </form>

        <aside className="setup-preview">
          <h2>{pharmacyName || "Eczane adı"}</h2>
          <p>{pharmacistName || "Eczacı adı"} · {city}/{district} · {locationTypeLabels[locationType]}</p>
          <div className="scenario-stats">
            <div>
              <WalletCards size={17} aria-hidden="true" />
              <span>Tahmini kira</span>
              <strong>{formatMoney(estimatedRent)}</strong>
            </div>
            <div>
              <Building2 size={17} aria-hidden="true" />
              <span>Rekabet</span>
              <strong>{districtProfile.competition}/100</strong>
            </div>
            <div>
              <Landmark size={17} aria-hidden="true" />
              <span>Depo erişimi</span>
              <strong>{districtProfile.supplierAccess}/100</strong>
            </div>
          </div>
          <div className="scenario-bars">
            <label>
              <span>Trafik</span>
              <i><b style={{ width: `${Math.min(100, districtProfile.traffic + modifier.traffic)}%` }} /></i>
            </label>
            <label>
              <span>Reçete baskısı</span>
              <i><b style={{ width: `${Math.min(100, districtProfile.prescriptionPressure + modifier.prescription)}%` }} /></i>
            </label>
            <label>
              <span>OTC/Dermo</span>
              <i><b style={{ width: `${Math.min(100, districtProfile.retailPotential + modifier.retail)}%` }} /></i>
            </label>
          </div>
          <div className="scenario-location">
            <MapPin size={17} aria-hidden="true" />
            <span>{modifier.description}</span>
          </div>
          <div className="setup-mode-note">
            <strong>{startModeLabels[startMode]}</strong>
            <span>{startModeDescriptions[startMode]}</span>
          </div>
        </aside>
      </section>

      <section className="scenario-picker-panel">
        <div className="scenario-heading">
          <div>
            <h2>{startModeLabels[startMode]} Senaryoları</h2>
            <p>
              {startMode === "new"
                ? "Sıfırdan açılışın da kendi oyun tarzı var: mahalle, cadde, turistik bölge gibi farklı kurulum dosyaları."
                : startMode === "takeover"
                  ? "Önceki devralma senaryoları burada duruyor; kurulum hazır, sorunlar hazır."
                  : "Kriz/kurtarma modunda seçtiğin dosya daha sert hedeflerle oynanır."}
            </p>
          </div>
          <TrendingUp size={22} aria-hidden="true" />
        </div>
        <div className="scenario-grid">
          {visibleScenarios.map((scenario) => (
            <article
              className={`scenario-card selectable ${selectedScenario.id === scenario.id ? "selected" : ""}`}
              key={scenario.id}
              onClick={() => pickScenario(scenario)}
            >
              <div className="scenario-card-head">
                <span>{scenarioModeLabel(startMode, scenario)}</span>
                <strong>{scenario.difficulty}</strong>
              </div>
              <h2>{startMode === "crisis" ? `${scenario.name} Krizi` : scenario.name}</h2>
              <p>{scenario.description}</p>
              <div className="scenario-location">
                <MapPin size={17} aria-hidden="true" />
                <span>{locationTypeLabels[scenario.locationType]}</span>
              </div>
              <div className="scenario-stats">
                <div>
                  <WalletCards size={17} aria-hidden="true" />
                  <span>Kasa</span>
                  <strong>{formatMoney(startMode === "new" ? Math.max(scenario.startingCash, 420000) : scenario.startingCash)}</strong>
                </div>
                <div>
                  <Building2 size={17} aria-hidden="true" />
                  <span>Depo borcu</span>
                  <strong>{formatMoney(startMode === "new" ? 0 : scenario.startingDebt)}</strong>
                </div>
                <div>
                  <Landmark size={17} aria-hidden="true" />
                  <span>SGK alacağı</span>
                  <strong>{formatMoney(startMode === "new" ? 0 : scenario.startingSgkReceivable)}</strong>
                </div>
              </div>
              <div className="tag-row">
                {scenario.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <button className="ghost-button" type="button">
                {selectedScenario.id === scenario.id ? "Seçili senaryo" : "Bu senaryoyu seç"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
