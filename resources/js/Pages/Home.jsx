import React, { useState } from 'react';
import Card from '../Components/ui/Card';
import Button from '../Components/ui/Button';
import Table from '../Components/ui/Table';
import Modal from '../Components/ui/Modal';
import Input from '../Components/ui/Input';

const Home = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const tableColumns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Nombre', accessor: 'name' },
        { header: 'Rol', accessor: 'role' },
        { header: 'Estado', cell: (row) => (
            <span className={`px-2 py-1 text-xs rounded-full ${
                row.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
                {row.status}
            </span>
        )}
    ];
    
    const tableData = [
        { id: 1, name: 'Juan Pérez', role: 'Estudiante', status: 'Activo' },
        { id: 2, name: 'María Gómez', role: 'Profesor', status: 'Activo' },
        { id: 3, name: 'Carlos López', role: 'Estudiante', status: 'Inactivo' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Panel Principal</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    Nuevo Usuario
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
                    <div className="p-2">
                        <p className="text-blue-100 text-sm font-medium">Total Estudiantes</p>
                        <p className="text-3xl font-bold mt-2">1,245</p>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
                    <div className="p-2">
                        <p className="text-purple-100 text-sm font-medium">Cursos Activos</p>
                        <p className="text-3xl font-bold mt-2">32</p>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none">
                    <div className="p-2">
                        <p className="text-emerald-100 text-sm font-medium">Asistencia Promedio</p>
                        <p className="text-3xl font-bold mt-2">94%</p>
                    </div>
                </Card>
            </div>

            <Card title="Usuarios Recientes">
                <Table columns={tableColumns} data={tableData} />
            </Card>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title="Crear Nuevo Usuario"
            >
                <div className="space-y-4">
                    <Input label="Nombre Completo" placeholder="Ej. Ana Ramírez" />
                    <Input label="Correo Electrónico" type="email" placeholder="ana@ejemplo.com" />
                    <Input label="Contraseña" type="password" placeholder="••••••••" />
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button>
                            Guardar Usuario
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Home;
