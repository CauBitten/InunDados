// Importa React e hooks essenciais para o componente
import React, { useState, useEffect } from 'react';
// Importa styled-components para estilização CSS-in-JS
import styled, { keyframes } from 'styled-components'; // Importa keyframes para animações
// Importa componentes do react-leaflet para o mapa
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
// Importa os estilos CSS do Leaflet
import 'leaflet/dist/leaflet.css';
// Importa o objeto L do Leaflet para configurar ícones padrão
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';

// Corrige o problema de ícone padrão do Leaflet em ambientes como Webpack/Vite
// Isso garante que os marcadores do mapa sejam exibidos corretamente
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- Dados Mockados para Demonstração Visual ---
// Estes dados simulam o que viria de um backend, permitindo a renderização visual.

// Importa tipos do GeoJSON para tipagem correta
// (Removido import duplicado de GeoJSON, pois os tipos já estão disponíveis globalmente)

// Dados GeoJSON mockados para a camada F1 (polígono de uma área)
const mockGeoJsonF1: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: { name: 'Área de Risco A', status: 'Inundada' },
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [-34.90, -8.10],
                    [-34.85, -8.10],
                    [-34.85, -8.05],
                    [-34.90, -8.05],
                    [-34.90, -8.10]
                ]]
            }
        }
    ]
};

// Dados GeoJSON mockados para a camada F2 (pontos de monitoramento)
const mockGeoJsonF2: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: { id: 1, tipo: 'Sensor Chuva', nivel: 'Alto' },
            geometry: {
                type: 'Point',
                coordinates: [-34.87, -8.06]
            }
        },
        {
            type: 'Feature',
            properties: { id: 2, tipo: 'Estação Pluviométrica', nivel: 'Médio' },
            geometry: {
                type: 'Point',
                coordinates: [-34.89, -8.08]
            }
        }
    ]
};

// Lista de cidades mockadas para o seletor
const mockCities = [
    'Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Paulista',
    'Cabo de Santo Agostinho', 'Camaragibe', 'São Lourenço da Mata',
    'Igarassu', 'Abreu e Lima', 'Ipojuca', 'Moreno', 'Araçoiaba',
    'Itapissuma', 'Itamaracá'
];

// URLs de imagens placeholder para os gráficos
// Usamos placehold.co para gerar imagens com texto descritivo
const chartPlaceholderUrls = {
    chuvaAcumulada: 'https://placehold.co/600x350/1A2B3C/E0A800?text=Gráfico+Chuva+Acumulada',
    chuvaDiariaCidades: 'https://placehold.co/600x350/1A2B3C/F2C45E?text=Gráfico+Chuva+Diária+Cidades',
    chuvaDiariaCidadeEspecifica: 'https://placehold.co/600x350/1A2B3C/E0A800?text=Gráfico+Chuva+Diária+Cidade+Específica',
    mortalidadeChuva: 'https://placehold.co/600x350/1A2B3C/F2C45E?text=Gráfico+Mortalidade+vs.+Chuva'
};

// --- Efeitos Visuais (Keyframes para animações) ---

// Animação de fade-in para elementos que aparecem na tela
const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

// Animação de brilho para o botão
const pulse = keyframes`
    0% {
        box-shadow: 0 0 0 0 rgba(224, 168, 0, 0.7);
    }
    70% {
        box-shadow: 0 0 0 15px rgba(224, 168, 0, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(224, 168, 0, 0);
    }
`;

// --- Estilização com Styled Components ---

// Paleta de Cores Definida
const colors = {
    darkNavy: '#1A2B3C', // Azul-marinho escuro (base)
    mediumNavy: '#2C4055', // Azul-marinho médio (para cards/seções)
    lightNavy: '#3D546B', // Azul-marinho claro (para detalhes)
    burntYellow: '#E0A800', // Amarelo queimado (destaque)
    lightBurntYellow: '#F2C45E', // Amarelo queimado mais claro (destaque suave)
    offWhite: '#F0F0F0', // Quase branco (texto em fundo escuro)
    lightGrey: '#A0A0A0', // Cinza claro (texto secundário)
    errorRed: '#DC3545', // Vermelho para mensagens de erro
};

// Container principal do dashboard, centraliza e aplica estilos globais
const DashboardContainer = styled.div`
    font-family: 'Inter', sans-serif; /* Fonte para o corpo do texto */
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px; /* Mais padding para um visual mais espaçoso */
    background: linear-gradient(135deg, ${colors.darkNavy} 0%, ${colors.mediumNavy} 100%); /* Gradiente de azul-marinho */
    min-height: 100vh;
    width: 100vw; /* Ocupa toda a largura da viewport */
    box-sizing: border-box;
    color: ${colors.offWhite}; /* Cor de texto padrão */
    overflow-x: hidden; /* Evita rolagem horizontal */
`;

// Estilização do cabeçalho principal
const Header = styled.header`
    width: 100%;
    max-width: 1600px; /* Aumenta a largura máxima para preencher mais */
    background: linear-gradient(45deg, ${colors.darkNavy}, ${colors.mediumNavy}); /* Gradiente sutil no cabeçalho */
    color: ${colors.offWhite};
    padding: 40px 60px; /* Mais padding */
    border-radius: 25px; /* Cantos bem arredondados */
    margin-bottom: 50px; /* Mais margem inferior */
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4); /* Sombra mais forte e difusa */
    text-align: center;
    position: relative;
    overflow: hidden; /* Para garantir que o pseudo-elemento não vaze */
    animation: ${fadeIn} 1s ease-out; /* Animação de fade-in */

    h1 {
        font-family: 'Oswald', sans-serif; /* Fonte ousada para o título */
        margin: 0;
        font-size: 4.5em; /* Título ainda maior */
        letter-spacing: 3px; /* Mais espaçamento entre letras */
        text-shadow: 3px 3px 6px rgba(0,0,0,0.3); /* Sombra no texto mais pronunciada */
        color: ${colors.burntYellow}; /* Destaque com amarelo queimado */
        position: relative;
        z-index: 1; /* Garante que o texto fique acima de qualquer efeito de fundo */
    }

    p {
        font-size: 1.3em;
        color: ${colors.lightGrey};
        margin-top: 10px;
        position: relative;
        z-index: 1;
    }

    /* Efeito de fundo abstrato */
    &::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 70%);
        transform: rotate(45deg);
        opacity: 0.1;
        animation: rotateBg 20s linear infinite; /* Animação de rotação sutil */
        z-index: 0;
    }

    @keyframes rotateBg {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    @media (max-width: 1024px) {
        padding: 30px 40px;
        h1 {
            font-size: 3.5em;
        }
        p {
            font-size: 1.1em;
        }
    }
    @media (max-width: 768px) {
        padding: 25px 30px;
        h1 {
            font-size: 2.5em;
        }
        p {
            font-size: 1em;
        }
    }
    @media (max-width: 480px) {
        padding: 20px 20px;
        h1 {
            font-size: 1.8em;
        }
        p {
            font-size: 0.9em;
        }
    }
`;

// Controles de filtro (data e cidade)
const Controls = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 30px; /* Espaçamento maior entre os controles */
    margin-bottom: 50px; /* Mais margem inferior */
    padding: 30px; /* Mais padding */
    background-color: ${colors.mediumNavy}; /* Fundo azul-marinho médio */
    border-radius: 20px; /* Cantos arredondados */
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3); /* Sombra mais forte */
    width: 100%;
    max-width: 1600px;
    justify-content: center;
    align-items: center;
    animation: ${fadeIn} 1.2s ease-out; /* Animação de fade-in */

    div {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px; /* Mais espaçamento */
    }

    label {
        font-weight: 700; /* Mais negrito */
        color: ${colors.offWhite}; /* Texto claro */
        font-size: 1.2em; /* Fonte maior */
        letter-spacing: 0.5px;
    }

    input[type="date"], select {
        padding: 14px 20px; /* Mais padding */
        border: 2px solid ${colors.lightNavy}; /* Borda mais visível */
        border-radius: 12px; /* Cantos mais arredondados */
        font-size: 1.1em;
        min-width: 200px; /* Largura mínima maior */
        background-color: ${colors.darkNavy}; /* Fundo escuro */
        color: ${colors.offWhite}; /* Texto claro */
        transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
        appearance: none; /* Remove estilos padrão do navegador */
        cursor: pointer;

        &:focus {
            border-color: ${colors.burntYellow}; /* Borda amarela no foco */
            box-shadow: 0 0 0 4px rgba(224, 168, 0, 0.3); /* Sombra amarela no foco */
            outline: none;
            background-color: ${colors.lightNavy}; /* Fundo ligeiramente mais claro no foco */
        }
        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }

    /* Estilo para a seta do select em navegadores que suportam */
    select {
        background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23F0F0F0%22%20d%3D%22M287%2C197.3L159.3%2C69.6c-3.8-3.8-10.1-3.8-13.9%2C0L5.3%2C197.3c-3.8%2C3.8-3.8%2C10.1%2C0%2C13.9l22.2%2C22.2c3.8%2C3.8%2C10.1%2C3.8%2C13.9%2C0L146.5%2C132.8c3.8-3.8%2C10.1-3.8%2C13.9%2C0l105.1%2C105.1c3.8%2C3.8%2C10.1%2C3.8%2C13.9%2C0l22.2-22.2C290.8%2C207.4%2C290.8%2C201.1%2C287%2C197.3z%22%2F%3E%3C%2Fsvg%3E');
        background-repeat: no-repeat;
        background-position: right 15px center;
        background-size: 15px;
        padding-right: 40px; /* Espaço para a seta */
    }

    button {
        background: linear-gradient(90deg, ${colors.burntYellow}, ${colors.lightBurntYellow}); /* Gradiente amarelo */
        color: ${colors.darkNavy}; /* Texto contrastante */
        padding: 15px 30px; /* Mais padding */
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-size: 1.2em;
        font-weight: bold;
        transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
        animation: ${pulse} 2s infinite; /* Animação de brilho no botão */

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
            background: linear-gradient(90deg, ${colors.lightBurntYellow}, ${colors.burntYellow}); /* Inverte o gradiente no hover */
        }
        &:active {
            transform: translateY(0);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
    }

    @media (max-width: 600px) {
        flex-direction: column;
        align-items: stretch;
        input[type="date"], select, button {
            width: 100%;
            min-width: unset;
        }
    }
`;

// Grid de conteúdo para organizar seções de mapa e gráficos
const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr; /* Padrão de uma coluna para mobile */
    gap: 35px; /* Espaçamento maior entre as seções */
    width: 100%;
    max-width: 1600px;
    animation: ${fadeIn} 1.4s ease-out; /* Animação de fade-in */

    @media (min-width: 768px) {
        grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); /* 2 colunas em telas médias */
    }

    @media (min-width: 1200px) {
        grid-template-columns: repeat(auto-fit, minmax(650px, 1fr)); /* Ajuste para mais colunas em telas grandes */
    }
`;

// Estilização para cada seção individual (mapa, gráficos)
const Section = styled.div`
    background-color: ${colors.mediumNavy}; /* Fundo azul-marinho médio */
    padding: 35px; /* Mais padding */
    border-radius: 20px; /* Cantos arredondados */
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3); /* Sombra mais forte */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 25px; /* Espaçamento entre título e conteúdo */
    transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); /* Transição suave e com curva */
    border: 1px solid rgba(255,255,255,0.05); /* Borda sutil */

    &:hover {
        transform: translateY(-8px); /* Elevação maior no hover */
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4); /* Sombra mais intensa no hover */
    }

    h2 {
        font-family: 'Oswald', sans-serif; /* Fonte ousada para títulos de seção */
        color: ${colors.lightBurntYellow}; /* Destaque com amarelo queimado mais claro */
        margin-top: 0;
        margin-bottom: 10px;
        text-align: center;
        font-size: 2.2em; /* Título de seção maior */
        font-weight: 700;
        letter-spacing: 0.8px;
        text-shadow: 1px 1px 3px rgba(0,0,0,0.2);
    }
    img {
        max-width: 100%;
        height: auto;
        display: block;
        border-radius: 12px; /* Cantos arredondados para imagens */
        box-shadow: 0 4px 12px rgba(0,0,0,0.2); /* Sombra para imagens */
        border: 1px solid rgba(255,255,255,0.1); /* Borda sutil para imagens */
    }
    p {
        color: ${colors.lightGrey}; /* Texto secundário */
        font-style: italic;
        text-align: center;
        font-size: 1.05em;
        line-height: 1.6;
    }
`;

// Wrapper para o mapa, garantindo altura e estilo
const MapWrapper = styled.div`
    height: 600px; /* Altura ainda mais generosa para o mapa */
    width: 100%;
    border-radius: 15px; /* Cantos mais arredondados */
    overflow: hidden;
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    border: 2px solid ${colors.lightNavy}; /* Borda para o mapa */
    .leaflet-container {
        background-color: ${colors.darkNavy}; /* Fundo do mapa mais escuro */
    }
`;

// Mensagens de carregamento/erro (estilizadas)
interface MessageProps {
    type?: 'error' | 'info';
}
const Message = styled.p<MessageProps>`
    color: ${props => (props.type === 'error' ? colors.errorRed : colors.burntYellow)}; /* Cores da paleta */
    font-weight: bold;
    text-align: center;
    margin-top: 40px;
    font-size: 1.4em; /* Fonte maior para mensagens */
    animation: ${fadeIn} 0.8s ease-out; /* Animação de fade-in */
`;


// --- Componente Principal InunDadosDashboard ---
const InunDadosDashboard = () => {
    // Estados para controlar as seleções do usuário
    const [selectedDate, setSelectedDate] = useState('2023-05-15');
    const [selectedCity, setSelectedCity] = useState('Recife');
    const [loading, setLoading] = useState(false); // Simula o estado de carregamento
    const [error, setError] = useState(null); // Simula o estado de erro
    // Centro aproximado da RMR (Região Metropolitana do Recife)
    const rmrCenter: LatLngTuple = [-8.0578, -34.882]; // Latitude e Longitude de Recife

    // Limites aproximados da RMR para o mapa (para maxBounds)
    const min_lat = -9.5;
    const max_lat = -7.0;
    const min_lon = -35.5;
    const max_lon = -34.5;

    // Simula uma chamada de API para obter os dados (sem backend real)
    useEffect(() => {
        setLoading(true);
        setError(null);
        // Simula um atraso de rede
        const timer = setTimeout(() => {
            setLoading(false);
            // Para testar o erro, descomente a linha abaixo:
            // setError("Erro simulado: Não foi possível carregar os dados.");
        }, 1800); // Atraso ligeiramente maior para a animação

        return () => clearTimeout(timer); // Limpa o timer na desmontagem
    }, [selectedDate, selectedCity]); // Roda quando data ou cidade mudam

    // Handlers para as mudanças nos seletores
    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value);
    };

    const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCity(event.target.value);
    };

    return (
        <DashboardContainer>
            {/* Cabeçalho da Aplicação */}
            <Header>
                <h1>INUNDADOS</h1>
                <p>Monitoramento Integrado da Região Metropolitana do Recife</p>
            </Header>

            {/* Controles de Filtro */}
            <Controls>
                <div>
                    <label htmlFor="date-picker">Selecione a Data:</label>
                    <input
                        type="date"
                        id="date-picker"
                        value={selectedDate}
                        onChange={handleDateChange}
                        disabled={loading}
                    />
                </div>
                <div>
                    <label htmlFor="city-selector">Selecione a Cidade:</label>
                    <select
                        id="city-selector"
                        value={selectedCity}
                        onChange={handleCityChange}
                        disabled={loading}
                    >
                        {mockCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
                {/* Botão de "Aplicar Filtros" pode ser adicionado se a lógica de filtro for mais complexa */}
                {/* <button onClick={() => alert('Filtros aplicados!')}>Aplicar Filtros</button> */}
            </Controls>

            {/* Mensagens de Carregamento/Erro */}
            {loading && <Message>Carregando dados e gerando visualizações...</Message>}
            {error && <Message type="error">{error}</Message>}

            {/* Conteúdo Principal (Mapa e Gráficos) */}
            {!loading && !error && (
                <ContentGrid>
                    {/* Seção do Mapa */}
                    <Section style={{ gridColumn: '1 / -1' }}> {/* Ocupa toda a largura em grids */}
                        <h2>Mapeamento Urbano e Uso do Solo na RMR</h2>
                        <MapWrapper>
                            <MapContainer
                                center={rmrCenter}
                                zoom={11}
                                minZoom={10}
                                maxZoom={13}
                                // Define os limites máximos de visualização do mapa
                                maxBounds={[[min_lat, min_lon], [max_lat, max_lon]]}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={true}
                                scrollWheelZoom={true}
                            >
                                {/* Camada base do mapa (OpenStreetMap com tema escuro se disponível ou customizado) */}
                                {/* Para um tema mais escuro, você pode usar uma tile layer diferente, ex: CartoDB DarkMatter */}
                                <TileLayer
                                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                                />
                                {/* Camada F1 (Polígono) */}
                                {mockGeoJsonF1 && (
                                    <GeoJSON
                                        data={mockGeoJsonF1}
                                        style={() => ({
                                            color: colors.lightBurntYellow, // Borda amarela queimada
                                            weight: 3,
                                            fillOpacity: 0.2,
                                            fillColor: colors.lightBurntYellow // Preenchimento suave
                                        })}
                                        onEachFeature={(feature, layer) => {
                                            if (feature.properties && feature.properties.name) {
                                                layer.bindPopup(`<strong>${feature.properties.name}</strong><br/>Status: ${feature.properties.status}`);
                                            }
                                        }}
                                    />
                                )}
                                {/* Camada F2 (Pontos) */}
                                {mockGeoJsonF2 && (
                                    <GeoJSON
                                        data={mockGeoJsonF2}
                                        pointToLayer={(_feature, latlng) => {
                                            return L.circleMarker(latlng, {
                                                radius: 8,
                                                fillColor: colors.burntYellow, // Pontos em amarelo queimado
                                                color: colors.offWhite, // Borda branca
                                                weight: 2,
                                                opacity: 1,
                                                fillOpacity: 0.9
                                            });
                                        }}
                                        onEachFeature={(feature, layer) => {
                                            if (feature.properties) {
                                                let popupContent = `<strong>Ponto de Monitoramento</strong><br/>`;
                                                for (const key in feature.properties) {
                                                    popupContent += `${key}: ${feature.properties[key]}<br/>`;
                                                }
                                                layer.bindPopup(popupContent);
                                            }
                                        }}
                                    />
                                )}
                                {/* Marcador de exemplo no centro da RMR */}
                                <Marker position={rmrCenter}>
                                    <Popup>Centro aproximado da RMR.</Popup>
                                </Marker>
                            </MapContainer>
                        </MapWrapper>
                        <p>Este mapa demonstra a visualização de áreas e pontos de interesse na RMR, com destaque para a topografia e o uso do solo.</p>
                    </Section>

                    {/* Seção de Gráficos de Chuva */}
                    <Section>
                        <h2>Chuva Acumulada por Cidade em {new Date(selectedDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                        <img src={chartPlaceholderUrls.chuvaAcumulada} alt="Gráfico de Chuva Acumulada (Placeholder)" />
                        <p>Este gráfico representaria a distribuição da chuva acumulada entre as cidades da RMR no mês selecionado.</p>
                    </Section>
                    <Section>
                        <h2>Chuva Diária por Cidades em {new Date(selectedDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                        <img src={chartPlaceholderUrls.chuvaDiariaCidades} alt="Gráfico de Chuva Diária por Cidades (Placeholder)" />
                        <p>Este gráfico ilustraria a variação diária do volume de chuva em diferentes localidades.</p>
                    </Section>
                    <Section>
                        <h2>Chuva Diária em {selectedCity} em {new Date(selectedDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                        <img src={chartPlaceholderUrls.chuvaDiariaCidadeEspecifica} alt={`Gráfico de Chuva Diária em ${selectedCity} (Placeholder)`} />
                        <p>Aqui, seria detalhada a ocorrência de chuvas dia a dia para a cidade selecionada.</p>
                    </Section>

                    {/* Seção de Comparação Diária: Óbitos e Chuvas */}
                    <Section>
                        <h2>Comparação Diária: Óbitos e Chuvas em {selectedCity} ({selectedDate})</h2>
                        <img src={chartPlaceholderUrls.mortalidadeChuva} alt="Gráfico de Comparação Mortalidade e Chuva (Placeholder)" />
                        <p>Este gráfico correlacionaria os dados de mortalidade com os volumes de chuva, explorando possíveis relações.</p>
                    </Section>
                </ContentGrid>
            )}
        </DashboardContainer>
    );
};

export default InunDadosDashboard;
