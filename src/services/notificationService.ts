import { Driver, Vehicle, AppNotification, Rental } from '../types';

export const checkRentalExpirations = (
  rentals: Rental[],
  vehicles: Vehicle[],
  drivers: Driver[],
  addNotification: (n: AppNotification) => void,
  existingNotifications: AppNotification[]
) => {
  const today = new Date();
  
  const isAlreadyNotified = (title: string, message: string) => {
    return existingNotifications.some(n => n.title === title && n.message === message);
  };

  rentals.forEach(rental => {
    if (rental.status === 'rented' && rental.end_date) {
      const endDate = new Date(rental.end_date);
      const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 7 && diffDays > 0) {
        const vehicle = vehicles.find(v => v.id === rental.vehicle_id);
        const driver = drivers.find(d => d.id === rental.driver_id);
        const title = `Fim de Contrato Próximo: ${vehicle?.plate}`;
        const message = `O contrato de aluguel do veículo ${vehicle?.plate} com o motorista ${driver?.full_name} termina em ${diffDays} dias (${rental.end_date}).`;

        if (!isAlreadyNotified(title, message)) {
          addNotification({
            id: `rental-end-${rental.id}-${Date.now()}`,
            title,
            message,
            date: today.toISOString().split('T')[0],
            read: false
          });
        }
      }
    }
  });
};

export const checkDocumentExpirations = (
  drivers: Driver[],
  vehicles: Vehicle[],
  addNotification: (n: AppNotification) => void,
  existingNotifications: AppNotification[]
) => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const isAlreadyNotified = (title: string, message: string) => {
    return existingNotifications.some(n => n.title === title && n.message === message);
  };

  // Check Vehicle Documents
  vehicles.forEach(vehicle => {
    const docs = [
      { name: 'Seguro', date: vehicle.insurance_expiry },
      { name: 'Inspeção', date: vehicle.inspection_expiry }
    ];

    docs.forEach(doc => {
      if (!doc.date) return;
      const expiryDate = new Date(doc.date);
      const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 30 && diffDays > 0) {
        const title = `Vencimento Próximo: ${doc.name}`;
        const message = `O ${doc.name} do veículo ${vehicle.plate} (${vehicle.brand} ${vehicle.model}) vence em ${diffDays} dias (${doc.date}).`;
        
        if (!isAlreadyNotified(title, message)) {
          addNotification({
            id: `expiry-v-${vehicle.id}-${doc.name}-${Date.now()}`,
            title,
            message,
            date: today.toISOString().split('T')[0],
            read: false
          });
        }
      } else if (diffDays <= 0) {
        const title = `Documento Expirado: ${doc.name}`;
        const message = `O ${doc.name} do veículo ${vehicle.plate} (${vehicle.brand} ${vehicle.model}) EXPIROU em ${doc.date}.`;
        
        if (!isAlreadyNotified(title, message)) {
          addNotification({
            id: `expired-v-${vehicle.id}-${doc.name}-${Date.now()}`,
            title,
            message,
            date: today.toISOString().split('T')[0],
            read: false
          });
        }
      }
    });
  });

  // Check Driver Documents
  drivers.forEach(driver => {
    driver.documents.forEach(doc => {
      if (!doc.expiry_date) return;
      const expiryDate = new Date(doc.expiry_date);
      const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 30 && diffDays > 0) {
        const title = `Vencimento de Documento: ${driver.full_name}`;
        const message = `O documento ${doc.type} do motorista ${driver.full_name} vence em ${diffDays} dias (${doc.expiry_date}).`;
        
        if (!isAlreadyNotified(title, message)) {
          addNotification({
            id: `expiry-d-${driver.id}-${doc.type}-${Date.now()}`,
            title,
            message,
            date: today.toISOString().split('T')[0],
            read: false
          });
        }
      } else if (diffDays <= 0) {
        const title = `Documento Expirado: ${driver.full_name}`;
        const message = `O documento ${doc.type} do motorista ${driver.full_name} EXPIROU em ${doc.expiry_date}.`;
        
        if (!isAlreadyNotified(title, message)) {
          addNotification({
            id: `expired-d-${driver.id}-${doc.type}-${Date.now()}`,
            title,
            message,
            date: today.toISOString().split('T')[0],
            read: false
          });
        }
      }
    });
  });
};
