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

const detailOptions = [
  { value: "Fuel", label: "Combustible" },
  { value: "Tolls", label: "Peajes y troncales" },
  { value: "PublicTransport", label: "Transporte público" },
  { value: "Parking", label: "Estacionamientos" },
  { value: "VehicleMaintenance", label: "Mantenimiento vehicular" },
  { value: "CarInsurance", label: "Seguro automotriz" },
  { value: "RideSharing", label: "Uber/Didi" },
  { value: "Supermarket", label: "Supermercado" },
  { value: "Greengrocer", label: "Verdulería" },
  { value: "Butcher", label: "Carnicería" },
  { value: "Bakery", label: "Panadería" },
  { value: "FastFood", label: "Comida rápida" },
  { value: "Restaurant", label: "Restaurante" },
  { value: "Delivery", label: "Delivery" },
  { value: "Rent", label: "Arriendo/Dividendo" },
  { value: "Water", label: "Agua" },
  { value: "Electricity", label: "Luz" },
  { value: "Gas", label: "Gas" },
  { value: "Internet", label: "Internet" },
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
  { value: "Entertainment", label: "Salidas" },
  { value: "CinemaTheater", label: "Cine/Teatro/Eventos" },
  { value: "Subscriptions", label: "Suscripciones" },
  { value: "Travel", label: "Viajes" },
  { value: "SportsGym", label: "Deportes y gimnasio" },
  { value: "Games", label: "Juegos" },
  { value: "Other", label: "Otro" },
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
  { value: "Charity", label: "Caridad" }
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
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedGraphMonth, setSelectedGraphMonth] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

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
    let filteredExpenses = expenses.filter(exp => exp.card === selectedCard);
    filteredExpenses.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
    if (selectedGraphMonth !== "all") {
      filteredExpenses = filteredExpenses.filter(exp => {
        const d = new Date(exp.registrationDate);
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const year = d.getFullYear();
        return `${year}-${month}` === selectedGraphMonth;
      });
    }
    const totals: { [key: string]: number } = {};
    filteredExpenses.forEach(exp => {
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
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    if (today.getDate() < 24) {
      return `24 de ${monthNames[today.getMonth()]}`;
    } else {
      let nextMonth = today.getMonth() + 1;
      if (nextMonth > 11) {
        nextMonth = 0;
      }
      return `24 de ${monthNames[nextMonth]}`;
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
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      return `${d.getFullYear()}-${month}`;
    })
  )).sort();

  return (
    <div className="container">
      <header className="header">
        <h1>Mis Pagos Mensuales</h1>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </header>
      <section className="filter-section">
        <label>Selecciona Tarjeta para Resumen:</label>
        <select value={selectedCard} onChange={(e) => { setSelectedCard(e.target.value); setCurrentPage(1); }}>
          <option value="Itau">Itau</option>
          <option value="Banco de Chile">Banco de Chile</option>
          <option value="Tenpo">Tenpo</option>
          <option value="Banco Estado">Banco Estado</option>
        </select>
      </section>
      <section className="form-section">
        <h2>Agregar Gasto</h2>
        <form onSubmit={handleAddExpense}>
          <div className="form-group">
            <label>Tarjeta:</label>
            <select value={card} onChange={(e) => setCard(e.target.value)}>
              <option value="Itau">Itau</option>
              <option value="Banco de Chile">Banco de Chile</option>
              <option value="Tenpo">Tenpo</option>
              <option value="Banco Estado">Banco Estado</option>
            </select>
          </div>
          <div className="form-group">
            <label>Monto Total (CLP):</label>
            <input type="text" value={totalAmountInput} onChange={handleTotalAmountChange} required />
          </div>
          <div className="form-group">
            <label>Cuotas:</label>
            <input type="number" value={installments} onChange={(e) => setInstallments(parseInt(e.target.value))} min="1" required />
          </div>
          <div className="form-group">
            <label>Mes de la Primera Cuota:</label>
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
          <button type="submit">Agregar Gasto</button>
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
          <label>Filtrar por mes de registro:</label>
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
                  <Cell key={`cell-${index}`} fill={["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#87cefa", "#87fefa", "#82ce2a", "#811e2a"][index % 8]} />
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
