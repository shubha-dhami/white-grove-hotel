import React, { useState, useEffect } from 'react';
import { Calendar, Hotel, MapPin, Users, Check, X, RefreshCw, Plus } from 'lucide-react';
import { supabase } from './supabaseClient';

const HotelBookingApp = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState('rooms');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from Supabase
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (properties.length > 0) {
      loadRooms(properties[selectedProperty].id);
    }
  }, [selectedProperty, properties]);

  useEffect(() => {
    loadBookings();
  }, [selectedDate, rooms]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('id');

      if (propertiesError) throw propertiesError;
      
      setProperties(propertiesData || []);
      
      if (propertiesData && propertiesData.length > 0) {
        await loadRooms(propertiesData[0].id);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async (propertyId) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('property_id', propertyId)
        .order('category, name');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const loadBookings = async () => {
    if (rooms.length === 0) return;
    
    try {
      const roomIds = rooms.map(room => room.id);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .in('room_id', roomIds)
        .eq('booking_date', selectedDate);

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const toggleRoomBooking = async (roomId) => {
    try {
      const existingBooking = bookings.find(b => b.room_id === roomId);
      
      if (existingBooking) {
        // Remove booking
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', existingBooking.id);
          
        if (error) throw error;
        
        setBookings(prev => prev.filter(b => b.id !== existingBooking.id));
      } else {
        // Add booking
        const { data, error } = await supabase
          .from('bookings')
          .insert([
            {
              room_id: roomId,
              booking_date: selectedDate,
              is_booked: true
            }
          ])
          .select();
          
        if (error) throw error;
        
        if (data) {
          setBookings(prev => [...prev, ...data]);
        }
      }
    } catch (error) {
      console.error('Error toggling booking:', error);
      alert('Error updating booking. Please try again.');
    }
  };

  const isRoomBooked = (roomId) => {
    return bookings.some(booking => booking.room_id === roomId);
  };

  const getAvailableRooms = () => {
    return rooms.filter(room => !isRoomBooked(room.id)).length;
  };

  const getTotalRooms = () => {
    return rooms.length;
  };

  const getRoomsByCategory = (category) => {
    return rooms.filter(room => room.category === category);
  };

  const getUniqueCategories = () => {
    return [...new Set(rooms.map(room => room.category))];
  };

  // Styles (same as before)
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9f0 0%, #e0f2fe 100%)',
      padding: '16px',
      fontFamily: 'Arial, sans-serif'
    },
    card: {
      maxWidth: '400px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    header: {
      background: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
      color: 'white',
      padding: '24px'
    },
    headerTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      margin: 0
    },
    subtitle: {
      fontSize: '14px',
      opacity: 0.9,
      margin: 0
    },
    select: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      backgroundColor: 'rgba(255,255,255,0.9)'
    },
    nav: {
      display: 'flex',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb'
    },
    navButton: {
      flex: 1,
      padding: '16px',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px'
    },
    navButtonActive: {
      backgroundColor: 'white',
      color: '#2563eb',
      borderBottom: '2px solid #2563eb'
    },
    content: {
      padding: '24px'
    },
    statsCard: {
      background: 'linear-gradient(135deg, #dbeafe 0%, #dcfce7 100%)',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '24px'
    },
    statsTitle: {
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    statsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '14px'
    },
    refreshButton: {
      background: 'none',
      border: 'none',
      color: '#059669',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px'
    },
    categoryTitle: {
      fontWeight: '600',
      color: '#374151',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '8px',
      marginBottom: '12px'
    },
    roomGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '24px'
    },
    roomCard: {
      padding: '16px',
      borderRadius: '12px',
      border: '2px solid',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    roomCardAvailable: {
      backgroundColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      color: '#166534'
    },
    roomCardBooked: {
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca',
      color: '#dc2626'
    },
    roomHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    roomName: {
      fontWeight: '500',
      margin: 0
    },
    roomStatus: {
      fontSize: '12px',
      marginTop: '4px',
      opacity: 0.75
    },
    dateInput: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '16px'
    },
    calendarCard: {
      backgroundColor: '#f9fafb',
      padding: '16px',
      borderRadius: '12px'
    },
    calendarTitle: {
      fontWeight: '600',
      color: '#374151',
      marginBottom: '12px'
    },
    categorySection: {
      marginBottom: '16px'
    },
    categoryName: {
      fontWeight: '500',
      color: '#4b5563',
      marginBottom: '8px'
    },
    miniRoomGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '8px'
    },
    miniRoom: {
      padding: '8px',
      borderRadius: '6px',
      textAlign: 'center',
      fontSize: '12px',
      border: '1px solid'
    },
    miniRoomAvailable: {
      backgroundColor: '#f0fdf4',
      color: '#166534',
      borderColor: '#bbf7d0'
    },
    miniRoomBooked: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      borderColor: '#fecaca'
    },
    summaryCard: {
      marginTop: '16px',
      padding: '12px',
      backgroundColor: '#dbeafe',
      borderRadius: '8px'
    },
    summaryText: {
      fontSize: '14px',
      color: '#1e40af'
    },
    footer: {
      backgroundColor: '#f9fafb',
      padding: '16px',
      textAlign: 'center'
    },
    footerText: {
      fontSize: '12px',
      color: '#6b7280'
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      color: '#6b7280'
    },
    error: {
      background: '#fef2f2',
      color: '#dc2626',
      padding: '12px',
      borderRadius: '8px',
      margin: '16px',
      textAlign: 'center'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loading}>
            <RefreshCw className="animate-spin" size={24} />
            <span style={{marginLeft: '8px'}}>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.error}>
            {error}
            <button onClick={loadData} style={{marginLeft: '8px', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer'}}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <Hotel size={32} />
            <div>
              <h1 style={styles.title}>White Grove Retreat</h1>
              <p style={styles.subtitle}>Room Management</p>
            </div>
            <button onClick={loadData} style={styles.refreshButton}>
              <RefreshCw size={20} />
            </button>
          </div>
          
          <div>
            <label style={{fontSize: '14px', opacity: 0.9, display: 'block', marginBottom: '8px'}}>
              Select Property:
            </label>
            <select 
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(Number(e.target.value))}
              style={styles.select}
            >
              {properties.map((property, index) => (
                <option key={property.id} value={index}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation */}
        <div style={styles.nav}>
          <button
            onClick={() => setView('rooms')}
            style={{
              ...styles.navButton,
              ...(view === 'rooms' ? styles.navButtonActive : {})
            }}
          >
            <Users size={20} />
            Rooms
          </button>
          <button
            onClick={() => setView('calendar')}
            style={{
              ...styles.navButton,
              ...(view === 'calendar' ? styles.navButtonActive : {})
            }}
          >
            <Calendar size={20} />
            Calendar
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {view === 'rooms' ? (
            <div>
              {/* Stats */}
              <div style={styles.statsCard}>
                <h3 style={styles.statsTitle}>
                  <MapPin size={16} />
                  {properties[selectedProperty]?.name}
                </h3>
                <div style={styles.statsRow}>
                  <span style={{color: '#059669', fontWeight: '500'}}>
                    Available: {getAvailableRooms()}
                  </span>
                  <span style={{color: '#6b7280'}}>
                    Total: {getTotalRooms()}
                  </span>
                </div>
              </div>

              {/* Rooms by Category */}
              {getUniqueCategories().map(category => (
                <div key={category}>
                  <h4 style={styles.categoryTitle}>
                    {category} Rooms
                  </h4>
                  <div style={styles.roomGrid}>
                    {getRoomsByCategory(category).map(room => {
                      const booked = isRoomBooked(room.id);
                      return (
                        <div
                          key={room.id}
                          onClick={() => toggleRoomBooking(room.id)}
                          style={{
                            ...styles.roomCard,
                            ...(booked ? styles.roomCardBooked : styles.roomCardAvailable)
                          }}
                        >
                          <div style={styles.roomHeader}>
                            <span style={styles.roomName}>{room.name}</span>
                            {booked ? (
                              <X size={20} color="#dc2626" />
                            ) : (
                              <Check size={20} color="#059669" />
                            )}
                          </div>
                          <p style={styles.roomStatus}>
                            {booked ? 'Booked' : 'Available'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {/* Date Selector */}
              <div>
                <label style={{display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px'}}>
                  Select Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={styles.dateInput}
                />
              </div>

              {/* Calendar View */}
              <div style={styles.calendarCard}>
                <h4 style={styles.calendarTitle}>
                  Room Availability for {new Date(selectedDate).toLocaleDateString()}
                </h4>
                
                <div>
                  {getUniqueCategories().map(category => (
                    <div key={category} style={styles.categorySection}>
                      <h5 style={styles.categoryName}>{category}</h5>
                      <div style={styles.miniRoomGrid}>
                        {getRoomsByCategory(category).map(room => {
                          const booked = isRoomBooked(room.id);
                          return (
                            <div
                              key={room.id}
                              style={{
                                ...styles.miniRoom,
                                ...(booked ? styles.miniRoomBooked : styles.miniRoomAvailable)
                              }}
                            >
                              {room.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.summaryCard}>
                  <p style={styles.summaryText}>
                    <strong>{getAvailableRooms()}</strong> out of <strong>{getTotalRooms()}</strong> rooms available
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            White Grove Retreat Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default HotelBookingApp;