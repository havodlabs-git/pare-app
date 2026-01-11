import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, User, Star, ChevronLeft, ChevronRight, X, Check, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface Professional {
  id: string;
  name: string;
  title: string;
  specialty: string;
  bio: string;
  photoUrl: string;
  rating: number;
  totalSessions: number;
  languages: string[];
}

interface TimeSlot {
  time: string;
  datetime: string;
  duration: number;
}

interface Appointment {
  id: string;
  professionalId: string;
  professionalName: string;
  scheduledAt: string;
  duration: number;
  status: string;
  zoomJoinUrl: string;
  notes: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}

interface AppointmentsProps {
  userPlan: string;
  onUpgrade?: () => void;
}

const Appointments: React.FC<AppointmentsProps> = ({ userPlan, onUpgrade }) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [view, setView] = useState<'list' | 'book' | 'appointments'>('list');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadProfessionals();
    loadMyAppointments();
  }, []);

  useEffect(() => {
    if (selectedProfessional && selectedDate) {
      loadAvailability();
    }
  }, [selectedProfessional, selectedDate]);

  const loadProfessionals = async () => {
    try {
      const response = await api.get('/appointments/professionals');
      if (response.data.success) {
        setProfessionals(response.data.data);
      }
    } catch (error) {
      console.error('Error loading professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyAppointments = async () => {
    try {
      const response = await api.get('/appointments/my-appointments?upcoming=true');
      if (response.data.success) {
        setMyAppointments(response.data.data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const loadAvailability = async () => {
    if (!selectedProfessional) return;
    
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await api.get(`/appointments/professionals/${selectedProfessional.id}/availability?date=${dateStr}`);
      if (response.data.success) {
        setAvailableSlots(response.data.data.availableSlots);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedProfessional || !selectedSlot) return;

    setBooking(true);
    try {
      const response = await api.post('/appointments/create', {
        professionalId: selectedProfessional.id,
        scheduledAt: selectedSlot.datetime,
        notes
      });

      if (response.data.success) {
        alert('Sessão agendada com sucesso!');
        setView('appointments');
        loadMyAppointments();
        setSelectedProfessional(null);
        setSelectedSlot(null);
        setNotes('');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao agendar sessão');
    } finally {
      setBooking(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta sessão?')) return;

    try {
      const response = await api.post(`/appointments/${appointmentId}/cancel`, {
        reason: 'Cancelado pelo usuário'
      });

      if (response.data.success) {
        loadMyAppointments();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao cancelar sessão');
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const days: CalendarDay[] = [];
    
    // Add days from previous month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        isPast: d < today
      });
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: d.getTime() === today.getTime(),
        isPast: d < today
      });
    }
    
    // Add days from next month
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        isPast: false
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    
    // Don't allow navigating to past months
    const today = new Date();
    if (direction === 'prev' && newMonth.getFullYear() === today.getFullYear() && newMonth.getMonth() < today.getMonth()) {
      return;
    }
    
    setCurrentMonth(newMonth);
  };

  const selectDate = (day: CalendarDay) => {
    if (day.isPast) return;
    setSelectedDate(day.date);
    setSelectedSlot(null);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Check if user has Elite plan
  if (userPlan !== 'elite') {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Video className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sessões com Psicólogos</h2>
        <p className="text-gray-600 mb-6">
          Agende sessões de acompanhamento com psicólogos especializados em dependências comportamentais.
          Este recurso está disponível exclusivamente para assinantes do plano Elite.
        </p>
        <button
          onClick={onUpgrade}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          Fazer Upgrade para Elite
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Render Calendar Component
  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div className="bg-gray-50 rounded-xl p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h4 className="text-lg font-semibold text-gray-900 capitalize">
            {formatMonthYear(currentMonth)}
          </h4>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isSelected = day.date.toDateString() === selectedDate.toDateString();
            return (
              <button
                key={index}
                onClick={() => selectDate(day)}
                disabled={day.isPast}
                className={`
                  relative p-2 h-10 rounded-lg text-sm font-medium transition-all
                  ${!day.isCurrentMonth ? 'text-gray-300' : day.isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'}
                  ${day.isToday && !isSelected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
                  ${isSelected ? 'bg-indigo-500 text-white' : !day.isPast ? 'hover:bg-gray-200' : ''}
                `}
              >
                {day.date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Selected Date Display */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 capitalize">
            <Calendar className="w-4 h-4 inline mr-2" />
            {formatDate(selectedDate)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('list')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'list' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Profissionais
        </button>
        <button
          onClick={() => setView('appointments')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'appointments' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Minhas Sessões
          {myAppointments.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {myAppointments.length}
            </span>
          )}
        </button>
      </div>

      {/* My Appointments View */}
      {view === 'appointments' && (
        <div className="space-y-4">
          {myAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma sessão agendada</h3>
              <p className="text-gray-600 mb-4">Agende sua primeira sessão com um de nossos profissionais.</p>
              <button
                onClick={() => setView('list')}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Ver Profissionais
              </button>
            </div>
          ) : (
            myAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{appointment.professionalName}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(appointment.scheduledAt).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {appointment.status === 'scheduled' && (
                      <>
                        <a
                          href={appointment.zoomJoinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
                        >
                          <Video className="w-4 h-4" />
                          Entrar
                        </a>
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {appointment.status === 'completed' && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        Concluída
                      </span>
                    )}
                    {appointment.status === 'cancelled' && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        Cancelada
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Professionals List View */}
      {view === 'list' && (
        <div className="grid md:grid-cols-2 gap-4">
          {professionals.length === 0 ? (
            <div className="col-span-2 bg-white rounded-2xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profissionais em breve</h3>
              <p className="text-gray-600">
                Em breve você poderá agendar sessões.
              </p>
            </div>
          ) : (
            professionals.map((professional) => (
              <div key={professional.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {professional.photoUrl ? (
                      <img src={professional.photoUrl} alt={professional.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-indigo-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{professional.name}</h4>
                    <p className="text-indigo-600 text-sm">{professional.title}</p>
                    <p className="text-gray-600 text-sm mt-1">{professional.specialty}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        {professional.rating.toFixed(1)}
                      </div>
                      <span>{professional.totalSessions} sessões</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedProfessional(professional);
                    setCurrentMonth(new Date());
                    setSelectedDate(new Date());
                    setView('book');
                  }}
                  className="w-full mt-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                >
                  Agendar Sessão
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Booking View with Calendar */}
      {view === 'book' && selectedProfessional && (
        <div className="bg-white rounded-2xl p-6">
          <button
            onClick={() => {
              setView('list');
              setSelectedProfessional(null);
              setSelectedSlot(null);
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              {selectedProfessional.photoUrl ? (
                <img src={selectedProfessional.photoUrl} alt={selectedProfessional.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-indigo-600" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{selectedProfessional.name}</h3>
              <p className="text-indigo-600">{selectedProfessional.title}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Selecione a data</h4>
              {renderCalendar()}
            </div>

            {/* Time Slots and Notes */}
            <div className="space-y-6">
              {/* Time Slots */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Horários disponíveis</h4>
                {availableSlots.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Nenhum horário disponível nesta data</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.datetime}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 px-3 rounded-xl border-2 transition-all font-medium ${
                          selectedSlot?.datetime === slot.datetime
                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Observações (opcional)</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Descreva brevemente o que gostaria de abordar na sessão..."
                  className="w-full p-3 border border-gray-200 rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Summary and Confirm */}
              {selectedSlot && (
                <div className="bg-indigo-50 rounded-xl p-4">
                  <h4 className="font-semibold text-indigo-900 mb-2">Resumo do Agendamento</h4>
                  <div className="space-y-1 text-sm text-indigo-700">
                    <p><strong>Profissional:</strong> {selectedProfessional.name}</p>
                    <p className="capitalize"><strong>Data:</strong> {formatDate(selectedDate)}</p>
                    <p><strong>Horário:</strong> {selectedSlot.time}</p>
                    <p><strong>Duração:</strong> {selectedSlot.duration} minutos</p>
                  </div>
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={handleBookAppointment}
                disabled={!selectedSlot || booking}
                className="w-full py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {booking ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Confirmar Agendamento
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
