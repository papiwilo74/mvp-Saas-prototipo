import { LogOut, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRestaurantConfig } from '../context/RestaurantConfigContext';

export function ProfilePage() {
  const { user, logout, isAdmin } = useAuth();
  const { config } = useRestaurantConfig();

  return (
    <div className="container-page py-6">
      <h1 className="text-2xl font-black">Perfil</h1>
      <section className="safe-panel mt-5 p-5">
        <p className="text-lg font-black">{user.name}</p>
        <p className="text-sm text-stone-600">{user.email}</p>
        {isAdmin ? (
          <Link to="/admin" className="btn-primary mt-4 w-full">
            <ShieldCheck size={18} />
            Ir al panel admin
          </Link>
        ) : null}
        <button type="button" onClick={logout} className="btn-secondary mt-3 w-full">
          <LogOut size={18} />
          Cerrar sesion
        </button>
      </section>

      <section className="safe-panel mt-5 p-5">
        <h2 className="font-black">Restaurante</h2>
        <div className="mt-4 space-y-3 text-sm text-stone-700">
          <p className="flex gap-2"><MapPin size={17} /> {config.address}</p>
          <p className="flex gap-2"><Phone size={17} /> {config.phone}</p>
          <p className="flex gap-2"><Mail size={17} /> {config.email}</p>
        </div>
      </section>
    </div>
  );
}
