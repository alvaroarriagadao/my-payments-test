import React, { useState, useEffect } from "react";
import { navigate } from "gatsby";
import { auth, firestore, firebase } from "../firebase/config";
import ReactSelect from "react-select";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "../styles/global.css";

interface Expense {
  id: string;
  card: string;
  totalAmount: number;
  installments: number;
  firstPaymentMonth: string;
  detail: string;
  userId: string;
  registrationDate: string;
}

const bankOptions = [ "Itau", "Tenpo", "Banco de Chile", "Santander", "BCI", "BancoEstado", "Scotiabank", "Banco Falabella", "MercadoPago", "Mach", "Banco Security", "Banco Ripley", "Banco BICE", ];

const detailOptions = [
  { value: "Fuel", label: "Combustible" },
  { value: "Supermarket", label: "Supermercado" },
  { value: "MercadoLibre", label: "Mercado Libre" },
  { value: "Butcher", label: "Carnicería" },
  { value: "Entertainment", label: "Carrete" },
  { value: "Water", label: "Agua" },
  { value: "Electricity", label: "Luz" },
  { value: "Gas", label: "Gas" },
  { value: "Internet", label: "Internet" },
  { value: "Tolls", label: "Peajes y troncales" },
  { value: "Restaurant", label: "Restaurante" },
  { value: "PublicTransport", label: "Transporte público" },
  { value: "Parking", label: "Estacionamientos" },
  { value: "VehicleMaintenance", label: "Mantenimiento vehicular" },
  { value: "CarInsurance", label: "Seguro automotriz" },
  { value: "RideSharing", label: "Uber/Didi" },
  { value: "Greengrocer", label: "Verdulería" },
  { value: "Bakery", label: "Panadería" },
  { value: "FastFood", label: "Comida rápida" },
  { value: "Delivery", label: "Delivery" },
  { value: "Rent", label: "Arriendo/Dividendo" },
  { value: "MobilePhone", label: "Teléfono móvil" },
  { value: "CommonExpenses", label: "Gastos comunes" },
  { value: "HomeInsurance", label: "Seguro hogar" },
  { value: "HealthInsurance", label: "Isapre/Fonasa" },
  { value: "MedicalConsultation", label: "Consulta médica" },
  { value: "MedicalTests", label: "Exámenes médicos" },
  { value: "Medicines", label: "Medicamentos" },
  { value: "Dental", label: "Dentista" },
  { value: "Optical", label: "Óptica/Lentes" },
  { value: "AlcoholTobacco", label: "Bebestibles" },
  { value: "CinemaTheater", label: "Cine/Teatro/Eventos" },
  { value: "Subscriptions", label: "Suscripciones" },
  { value: "Travel", label: "Viajes" },
  { value: "SportsGym", label: "Deportes y gimnasio" },
  { value: "Games", label: "Juegos" },
  { value: "Clothing", label: "Ropa" },
  { value: "Gifts", label: "Regalos" },
  { value: "Supplies", label: "Insumos" },
  { value: "Education", label: "Educación" },
  { value: "Hygiene", label: "Higiene" },
  { value: "Beauty", label: "Belleza" },
  { value: "Childcare", label: "Cuidado Infantil" },
  { value: "PetExpenses", label: "Gastos de Mascota" },
  { value: "OfficeSupplies", label: "Suministros de Oficina" },
  { value: "Furniture", label: "Muebles" },
  { value: "CableTV", label: "Cable/TV" },
  { value: "BankingFees", label: "Comisiones Bancarias" },
  { value: "Taxes", label: "Impuestos" },
  { value: "InternetStreaming", label: "Streaming" },
  { value: "Fitness", label: "Fitness" },
  { value: "TravelExpenses", label: "Gastos de Viaje" },
  { value: "MedicalCoPay", label: "Copago Médico" },
  { value: "PersonalCare", label: "Cuidado Personal" },
  { value: "Books", label: "Libros" },
  { value: "Charity", label: "Caridad" },
  { value: "Other", label: "Otro" }
];

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const getDefaultMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
};

const formatNumber = (value: number | string): string => {
  const numberValue = typeof value === "number" ? value : Number(value.replace(/\D/g, ""));
  return numberValue.toLocaleString("es-CL");
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const getDetailLabel = (value: string): string => {
  const option = detailOptions.find((opt) => opt.value === value);
  return option ? option.label : value;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ backgroundColor: "rgba(255,255,255,0.8)", padding: "8px", borderRadius: "4px" }}>
        <p className="label" style={{ margin: 0 }}>
          {`${payload[0].name}: ${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(payload[0].payload.total)}`}
        </p>
      </div>
    );
  }
  return null;
};

const IndexPage: React.FC = () => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedCard, setSelectedCard] = useState("Itau");
  const [card, setCard] = useState("Itau");
  const [totalAmountRaw, setTotalAmountRaw] = useState<number>(0);
  const [totalAmountInput, setTotalAmountInput] = useState<string>("");
  const [installments, setInstallments] = useState<number>(1);
  const [firstPaymentMonth, setFirstPaymentMonth] = useState<string>(getDefaultMonth());
  const [detailOption, setDetailOption] = useState<any>(null);
  const [customDetail, setCustomDetail] = useState<string>("");
  const [billingDay, setBillingDay] = useState<number>(24);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedGraphMonth, setSelectedGraphMonth] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const itemsPerPage = 15;

  useEffect(() => {
    const storedDefaults = localStorage.getItem("defaultSettings");
    if (storedDefaults) {
      const defaults = JSON.parse(storedDefaults);
      if (defaults.selectedCard) setSelectedCard(defaults.selectedCard);
      if (defaults.card) setCard(defaults.card);
      if (defaults.billingDay) setBillingDay(defaults.billingDay);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      if (usr) {
        setUser(usr);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = firestore.collection("expenses")
        .where("userId", "==", user.uid)
        .onSnapshot((snapshot) => {
          const data: Expense[] = [];
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() } as Expense);
          });
          setExpenses(data);
        });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    let filteredForGraph = expenses.filter(exp => exp.card === selectedCard);
    if (selectedGraphMonth !== "all") {
      filteredForGraph = filteredForGraph.filter(exp => {
        const d = new Date(exp.registrationDate);
        return monthNames[d.getMonth()] === selectedGraphMonth;
      });
    }
    const totals: { [key: string]: number } = {};
    filteredForGraph.forEach(exp => {
      const label = getDetailLabel(exp.detail);
      totals[label] = (totals[label] || 0) + exp.totalAmount;
    });
    const data = Object.keys(totals).map(key => ({ name: key, total: totals[key] }));
    setChartData(data);
  }, [expenses, selectedCard, selectedGraphMonth]);

  const handleLogout = () => {
    auth.signOut().then(() => navigate("/login"));
  };

  const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const numericValue = Number(rawValue);
    setTotalAmountRaw(numericValue);
    const formatted = numericValue ? formatNumber(numericValue) : "";
    setTotalAmountInput(formatted);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const finalDetail = detailOption?.value === "Other" ? customDetail : detailOption?.value;
    if (!finalDetail) {
      alert("Seleccione un detalle o ingrese uno si eligió 'Otro'.");
      return;
    }
    if (totalAmountRaw <= 0 || installments < 1) {
      alert("Verifique que el monto y las cuotas sean válidos.");
      return;
    }
    const data = {
      card,
      totalAmount: totalAmountRaw,
      installments,
      firstPaymentMonth,
      detail: finalDetail,
      userId: user.uid,
      registrationDate: new Date().toISOString()
    };
    try {
      await firestore.collection("expenses").add(data);
      setCard("Itau");
      setTotalAmountRaw(0);
      setTotalAmountInput("");
      setInstallments(1);
      setFirstPaymentMonth(getDefaultMonth());
      setDetailOption(null);
      setCustomDetail("");
    } catch (error) {
      console.error(error);
    }
  };

  const getNextBillingDate = (): string => {
    const today = new Date();
    const bd = billingDay;
    if (today.getDate() < bd) {
      return `${bd} de ${monthNames[today.getMonth()]}`;
    } else {
      let nextMonth = today.getMonth() + 1;
      if (nextMonth > 11) nextMonth = 0;
      return `${bd} de ${monthNames[nextMonth]}`;
    }
  };

  const calculateSummary = () => {
    const filtered = expenses.filter(exp => exp.card === selectedCard);
    const totalCard = filtered.reduce((acc, exp) => acc + exp.totalAmount, 0);
    const summary: { [key: string]: number } = {};
    filtered.forEach(exp => {
      const monthlyPayment = exp.totalAmount / exp.installments;
      let [year, month] = exp.firstPaymentMonth.split("-").map(Number);
      for (let i = 0; i < exp.installments; i++) {
        const current = new Date(year, month - 1 + i, 1);
        const key = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, "0")}`;
        summary[key] = (summary[key] || 0) + monthlyPayment;
      }
    });
    return { summary, totalCard };
  };

  const { summary, totalCard } = calculateSummary();
  const sortedMonths = Object.keys(summary).sort();

  const filteredExpenses = expenses
    .filter(exp => exp.card === selectedCard)
    .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
  const indexOfLastExpense = currentPage * itemsPerPage;
  const indexOfFirstExpense = indexOfLastExpense - itemsPerPage;
  const currentExpenses = filteredExpenses.slice(indexOfFirstExpense, indexOfLastExpense);
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  const uniqueGraphMonths = Array.from(new Set(
    expenses.filter(exp => exp.card === selectedCard).map(exp => {
      const d = new Date(exp.registrationDate);
      return monthNames[d.getMonth()];
    })
  )).sort((a, b) => monthNames.indexOf(a) - monthNames.indexOf(b));

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSaveDefaults = (e: React.FormEvent) => {
    e.preventDefault();
    const defaults = {
      selectedCard: card,
      card: card,
      billingDay
    };
    localStorage.setItem("defaultSettings", JSON.stringify(defaults));
    setSelectedCard(defaults.selectedCard);
    setCard(defaults.card);
    closeModal();
  };

  useEffect(() => {
    const storedDefaults = localStorage.getItem("defaultSettings");
    if (storedDefaults) {
      const defaults = JSON.parse(storedDefaults);
      if (defaults.selectedCard) setSelectedCard(defaults.selectedCard);
      if (defaults.card) setCard(defaults.card);
      if (defaults.billingDay) setBillingDay(defaults.billingDay);
    }
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1>Mis pagos tarjetas de Créditos</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={openModal}>Configuración predeterminada</button>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </header>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Configuración Predeterminada</h3>
            <form onSubmit={handleSaveDefaults}>
              <div className="form-group">
                <label>Selecciona Tarjeta para Resumen:</label>
                <select value={card} onChange={(e) => setCard(e.target.value)}>
                  {bankOptions.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de Facturación (día):</label>
                <select value={billingDay} onChange={(e) => setBillingDay(parseInt(e.target.value))}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                <button type="submit">Guardar</button>
                <button type="button" onClick={closeModal}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <section className="filter-section">
        <label>Selecciona Resumen:</label>
        <select value={selectedCard} onChange={(e) => { setSelectedCard(e.target.value); setCurrentPage(1); }}>
          {bankOptions.map(bank => (
            <option key={bank} value={bank}>{bank}</option>
          ))}
        </select>
      </section>
      <section className="form-section">
        <h2>Agregar Gasto</h2>
        <form onSubmit={handleAddExpense}>
          <div className="form-group">
            <label>Tarjeta de compra:</label>
            <select value={card} onChange={(e) => setCard(e.target.value)}>
              {bankOptions.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Monto Total (CLP):</label>
            <input type="text" value={totalAmountInput} onChange={handleTotalAmountChange} required />
          </div>
          <div className="form-group">
            <label>Número de cuotas:</label>
            <input type="number" value={installments} onChange={(e) => setInstallments(parseInt(e.target.value))} min="1" required />
          </div>
          <div className="form-group">
            <label>Mes de la primera Cuota:</label>
            <input type="month" value={firstPaymentMonth} onChange={(e) => setFirstPaymentMonth(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Detalle del Gasto:</label>
            <ReactSelect
              options={detailOptions}
              value={detailOption}
              onChange={(option) => setDetailOption(option)}
              isSearchable
              placeholder="Seleccione detalle..."
            />
            {detailOption && detailOption.value === "Other" && (
              <input type="text" value={customDetail} onChange={(e) => setCustomDetail(e.target.value)} placeholder="Ingrese detalle" />
            )}
          </div>
          <button class="button-add" type="submit">Agregar Gasto</button>
        </form>
      </section>
      <section className="purchases-section">
        <h2>Gastos Registrados</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Detalle</th>
                <th>Monto Total</th>
                <th>Cuotas</th>
                <th>Mes Primera Cuota</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentExpenses.map(exp => (
                <tr key={exp.id}>
                  <td>{getDetailLabel(exp.detail)}</td>
                  <td>{new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(exp.totalAmount)}</td>
                  <td>{exp.installments}</td>
                  <td>{exp.firstPaymentMonth}</td>
                  <td>{formatDate(exp.registrationDate)}</td>
                  <td>
                    <button onClick={async () => { await firestore.collection("expenses").doc(exp.id).delete(); }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredExpenses.length > itemsPerPage && (
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Anterior</button>
              <span>{currentPage} / {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Siguiente</button>
            </div>
          )}
        </div>
      </section>
      <section className="summary-section">
        <h2>Resumen Mensual</h2>
        <div className="summary-container">
          <div className="total-card">
            <h4>
              Total acumulado para {selectedCard}: {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(totalCard)}
            </h4>
          </div>
          <div className="billing-summary">
            <h4>Próxima fecha de facturación: {getNextBillingDate()}</h4>
          </div>
          <div className="table-summary">
            <table>
              <thead>
                <tr>
                  {sortedMonths.map(month => <th key={month}>{month}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {sortedMonths.map(month => (
                    <td key={month}>
                      {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(summary[month])}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="chart-section">
        <h2>Gráfico de Gastos</h2>
        <div className="graph-filter">
          <label>Filtrar por mes:</label>
          <select value={selectedGraphMonth} onChange={(e) => { setSelectedGraphMonth(e.target.value); setCurrentPage(1); }}>
            <option value="all">Todos</option>
            {uniqueGraphMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={chartData} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#87cefa", "#27cefa", "#412efa", "#872efa"][index % 8]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default IndexPage;
