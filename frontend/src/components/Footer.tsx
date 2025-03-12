import React from 'react';


const Footer = () => {

    return (
        <footer className="bg-green-700 text-white py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contacto</h3>
                        <p>
                            <strong>Dirección:</strong> Las Flores, Envigado, Colombia
                        </p>
                        <p>
                            <strong>Teléfono:</strong> +123 456 789
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Horario de Atención</h3>
                        <p>
                            Lunes a Viernes: 8:00 - 20:00
                        </p>
                        <p>
                            Sábado: 9:00 - 19:30
                        </p>
                        <p>
                            Domingo: Cerrado
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Sobre Nosotros</h3>
                        <p>
                            Somos un supermercado especializado en la venta de productos frescos y de alta calidad.
                        </p>
                        <p>Contamos con entrega el mismo día en tu zona.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
export default Footer;