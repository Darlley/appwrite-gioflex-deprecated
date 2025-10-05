"use client"
import React, { useState } from 'react';
import { Shield, Calendar, User, AlertCircle, Plus, MoreHorizontal, Clock } from 'lucide-react';
import PageContainer from '@/components/page-container';

type TaskStatus = 'pendente' | 'fazendo' | 'concluido';
type TaskType = 'padrao' | 'minhas';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: string;
  priority: 'baixa' | 'media' | 'alta';
  dueDate?: Date;
  tags: string[];
  type: TaskType;
  createdBy: string;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Pendência de Pagamento - Março',
    description: 'Pagamento da mensalidade do serviço de segurança referente ao mês de março.',
    status: 'pendente',
    assignedTo: 'Carlos Oliveira',
    priority: 'alta',
    dueDate: new Date('2024-02-15'),
    tags: ['pagamento', 'financeiro'],
    type: 'padrao',
    createdBy: 'Admin'
  },
  {
    id: '2',
    title: 'Ronda Noturna - Edifício Central',
    description: 'Verificação de segurança do perímetro e áreas comuns do edifício.',
    status: 'fazendo',
    assignedTo: 'Ana Costa',
    priority: 'media',
    tags: ['ronda', 'segurança'],
    type: 'minhas',
    createdBy: 'João Silva'
  },
  {
    id: '3',
    title: 'Atualização do Sistema de Câmeras',
    description: 'Instalação e configuração das novas câmeras de segurança.',
    status: 'concluido',
    assignedTo: 'Carlos Oliveira',
    priority: 'alta',
    tags: ['equipamento', 'instalação'],
    type: 'padrao',
    createdBy: 'Admin'
  },
  {
    id: '4',
    title: 'Relatório Mensal de Segurança',
    description: 'Compilação dos dados de segurança e incidentes do mês.',
    status: 'pendente',
    assignedTo: 'Maria Santos',
    priority: 'media',
    dueDate: new Date('2024-02-01'),
    tags: ['relatório', 'mensal'],
    type: 'minhas',
    createdBy: 'João Silva'
  },
  {
    id: '5',
    title: 'Treinamento de Novos Funcionários',
    description: 'Capacitação em procedimentos de segurança e uso de equipamentos.',
    status: 'fazendo',
    assignedTo: 'João Silva',
    priority: 'baixa',
    tags: ['treinamento', 'rh'],
    type: 'padrao',
    createdBy: 'Admin'
  },
  {
    id: '6',
    title: 'Inspeção de Equipamentos',
    description: 'Verificação mensal do estado dos equipamentos de segurança.',
    status: 'pendente',
    assignedTo: 'Maria Santos',
    priority: 'media',
    dueDate: new Date('2024-02-10'),
    tags: ['inspeção', 'equipamentos'],
    type: 'minhas',
    createdBy: 'João Silva'
  }
];

const columns = [
  { 
    status: 'pendente' as TaskStatus, 
    title: 'Não iniciado', 
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    dotColor: 'bg-gray-400'
  },
  { 
    status: 'fazendo' as TaskStatus, 
    title: 'Em andamento', 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    dotColor: 'bg-blue-500'
  },
  { 
    status: 'concluido' as TaskStatus, 
    title: 'Concluído', 
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    dotColor: 'bg-green-500'
  }
];

const tabs = [
  { id: 'padrao' as TaskType, label: 'Padrão', description: 'Tarefas atribuídas pela administração' },
  { id: 'minhas' as TaskType, label: 'Minhas', description: 'Tarefas criadas por você' }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'alta': return 'bg-red-100 text-red-800 border-red-200';
    case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'baixa': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

function page () {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TaskType>('padrao');

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTask) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === draggedTask ? { ...task, status } : task
        )
      );
      setDraggedTask(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => task.type === activeTab);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return getFilteredTasks().filter(task => task.status === status);
  };

  const getTabCount = (tabType: TaskType) => {
    return tasks.filter(task => task.type === tabType).length;
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <PageContainer title="Gestão de Tarefas e Eventos" className="p-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Cadastrar Ronda</h2>
            <p className="text-gray-500 text-sm">Gerencie e acompanhe o progresso das rondas de segurança</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Nova
          </button>
        </div>

        {/* Tabs - Notion Style */}
        <div className="mb-8">
          <div className="flex items-center gap-1 mb-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {getTabCount(tab.id)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Kanban Board - Notion Style */}
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map(column => {
            const columnTasks = getTasksByStatus(column.status);
            
            return (
              <div
                key={column.status}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-4 px-2">
                  <div className={`w-2 h-2 rounded-full ${column.dotColor}`}></div>
                  <h3 className={`font-medium text-sm ${column.color}`}>{column.title}</h3>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                
                {/* Tasks */}
                <div className="space-y-2">
                  {columnTasks.map(task => {
                    const isOverdue = task.dueDate && new Date() > task.dueDate && task.status !== 'concluido';
                    
                    return (
                      <div
                        key={task.id}
                        className={`group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200 cursor-move ${
                          draggedTask === task.id ? 'opacity-50 scale-95' : ''
                        } ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        onDragEnd={handleDragEnd}
                      >
                        {/* Task Header */}
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900 text-sm leading-5 pr-2">
                            {task.title}
                          </h4>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                        
                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{task.description}</p>
                        
                        {/* Tags */}
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {task.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{task.assignedTo}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            
                            {task.dueDate && (
                              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(task.dueDate)}</span>
                                {isOverdue && <AlertCircle className="w-3 h-3" />}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Creator info for "Minhas" tab */}
                        {activeTab === 'minhas' && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 border-t border-gray-100 pt-2">
                            <Clock className="w-3 h-3" />
                            <span>Criado por {task.createdBy}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Add New Card */}
                  <button className="w-full p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors group">
                    <div className="flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">Nova página</span>
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {getFilteredTasks().length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma tarefa encontrada
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {activeTab === 'padrao' 
                ? 'Não há tarefas padrão no momento.' 
                : 'Você ainda não criou nenhuma tarefa.'
              }
            </p>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors mx-auto">
              <Plus className="w-4 h-4" />
              Criar primeira tarefa
            </button>
          </div>
        )}
    </PageContainer>
  );
}

export default page;