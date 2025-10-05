"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  ArrowRight, 
  Play, 
  Check, 
  Users, 
  Award, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { teams } from '@/lib/appwrite';

export default function LandingPage({ params }: { params: { id: string }}) {
  const [teamName, setTeamName] = useState('');
  const teamId = params.id

  useEffect(() => {
    if (teamId) {
      const getTeamName = async () => {
        try {
          const team = await teams.get(teamId as string);
          setTeamName(team.name);
        } catch (error) {
          console.error("Error fetching team name:", error);
        }
      };
      getTeamName();
    }
  }, [teamId]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const services = [
    {
      title: "Desenvolvimento Web",
      description: "Sites modernos e responsivos que convertem visitantes em clientes",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      price: "A partir de R$ 2.500"
    },
    {
      title: "Marketing Digital",
      description: "Estratégias completas para aumentar sua presença online",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
      price: "A partir de R$ 1.800"
    },
    {
      title: "Consultoria Empresarial",
      description: "Otimização de processos e crescimento sustentável",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop",
      price: "A partir de R$ 3.000"
    },
    {
      title: "Design Gráfico",
      description: "Identidade visual impactante para sua marca",
      image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop",
      price: "A partir de R$ 800"
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "CEO, TechStart",
      content: "Transformaram completamente nosso negócio. Resultados impressionantes em apenas 3 meses!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "João Santos",
      role: "Diretor, InnovateCorp",
      content: "Profissionalismo excepcional e entrega além das expectativas. Recomendo fortemente!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "Ana Costa",
      role: "Fundadora, GreenTech",
      content: "Estratégia digital que gerou 300% de aumento nas vendas. Parceria que vale ouro!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
    }
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop"
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header/Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {teamName}
                </h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-8">
                <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">Serviços</a>
                <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">Sobre</a>
                <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contato</a>
                <Button>Começar Agora</Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  🚀 Transformação Digital
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Transformamos suas{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ideias em realidade
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Soluções digitais completas para empresas que querem se destacar no mercado. 
                  Do planejamento à execução, cuidamos de cada detalhe do seu sucesso.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Começar Projeto <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="group">
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Ver Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Projetos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Satisfação</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">24h</div>
                  <div className="text-sm text-gray-600">Suporte</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl rotate-6 scale-105 opacity-20"></div>
              <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Crescimento Garantido</h3>
                        <p className="text-gray-600">Resultados mensuráveis em 30 dias</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Estratégia personalizada</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Implementação completa</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Suporte contínuo</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-800">Nossos Serviços</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Soluções que fazem a diferença
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Oferecemos um conjunto completo de serviços digitais para impulsionar seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-2xl font-bold text-blue-600">{service.price}</div>
                    <Button className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600">
                      Saiba Mais
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800">Nosso Trabalho</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Projetos que inspiram
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cada projeto é uma oportunidade de criar algo extraordinário
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <div 
                key={index} 
                className="group relative overflow-hidden rounded-xl cursor-pointer"
              >
                <img 
                  src={image} 
                  alt={`Projeto ${index + 1}`}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-6 text-white">
                    <h3 className="text-lg font-semibold">Projeto {index + 1}</h3>
                    <p className="text-sm opacity-90">Clique para ampliar</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            <img 
              src={selectedImage} 
              alt="Projeto ampliado"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800">Depoimentos</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
          </div>

          <div className="relative">
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentSlide].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-xl text-gray-700 mb-6 italic">
                  "{testimonials[currentSlide].content}"
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <img 
                    src={testimonials[currentSlide].image} 
                    alt={testimonials[currentSlide].name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonials[currentSlide].name}</div>
                    <div className="text-gray-600">{testimonials[currentSlide].role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              variant="outline" 
              size="icon" 
              className="absolute left-4 top-1/2 -translate-y-1/2"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onClick={nextSlide}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-6">
                Pronto para transformar seu negócio?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Entre em contato conosco e descubra como podemos ajudar sua empresa a alcançar novos patamares.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Phone className="h-6 w-6" />
                  <span className="text-lg">(67) 99999-9999</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="h-6 w-6" />
                  <span className="text-lg">contato@innovatepro.com</span>
                </div>
                <div className="flex items-center space-x-4">
                  <MapPin className="h-6 w-6" />
                  <span className="text-lg">Campo Grande, MS</span>
                </div>
              </div>
            </div>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Nome</label>
                      <Input className="bg-white/20 border-white/30 text-white placeholder:text-white/60" placeholder="Seu nome" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Email</label>
                      <Input className="bg-white/20 border-white/30 text-white placeholder:text-white/60" placeholder="seu@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Mensagem</label>
                    <Textarea className="bg-white/20 border-white/30 text-white placeholder:text-white/60" placeholder="Como podemos ajudar?" rows={4} />
                  </div>
                  <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                    Enviar Mensagem
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                InnovatePro
              </h3>
              <p className="text-gray-400">
                Transformando ideias em soluções digitais que geram resultados extraordinários.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Serviços</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Desenvolvimento Web</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Marketing Digital</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Consultoria</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Design Gráfico</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Portfólio</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-gray-400">
                <p>📞 (67) 99999-9999</p>
                <p>✉️ contato@innovatepro.com</p>
                <p>📍 Campo Grande, MS</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 InnovatePro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
