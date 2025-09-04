import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/lib/theme-provider';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarketItem, useMarketStore } from '@/stores/marketStore';
import * as d3 from 'd3';


interface MarketStatsModalProps {
  item: MarketItem;
  isOpen: boolean;
  onClose: () => void;
}

function AreaChart({ data, isDark, color = '#22c55e' }: { data: any[], isDark: boolean, color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = React.useState<{
    x: number;
    y: number;
    value: number;
    date: string;
    visible: boolean;
  }>({ x: 0, y: 0, value: 0, date: '', visible: false });

  useEffect(() => {
    if (!ref.current || !data.length) return;
    ref.current.innerHTML = '';

    const width = 600;
    const height = 250;
    const margin = { top: 10, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    let extendedData = data;
    if (data.length > 0) {
      const first = { ...data[0], date: 'start' };
      const last = { ...data[data.length - 1], date: 'end' };
      extendedData = [first, ...data, last];
    }

    const x = d3.scaleLinear()
      .domain([0, extendedData.length - 1])
      .range([0, chartWidth]);
    const y = d3.scaleLinear()
      .domain([
        d3.min(extendedData, d => d.close) ?? 0,
        d3.max(extendedData, d => d.close) ?? 1
      ])
      .nice()
      .range([chartHeight, 0]);

    const maxLabels = 6;
    const labelIndexes: number[] = [];
    if (data.length > 1) {
      for (let i = 0; i < maxLabels; i++) {
        labelIndexes.push(Math.round(i * (data.length - 1) / (maxLabels - 1)));
      }
    } else {
      labelIndexes.push(0);
    }
    const svg = d3.select(ref.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', isDark ? '#242424' : '#F8F8F8');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(
        d3.scalePoint()
          .domain(data.map((_, i) => i.toString()))
          .range([x(1), x(extendedData.length - 2)])
      ).tickFormat((_, i) => {
        if (labelIndexes.includes(i)) {
          const date = new Date(data[i]?.date);
          return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
        }
        return '';
      }))
      .selectAll('text')
      .attr('font-size', 10)
      .attr('fill', isDark ? '#aaa' : '#333');

    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('font-size', 10)
      .attr('fill', isDark ? '#aaa' : '#333');

    const area = d3.area<any>()
      .x((_, i) => x(i))
      .y0(chartHeight)
      .y1(d => y(d.close))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(extendedData)
      .attr('fill', color)
      .attr('fill-opacity', 0.25)
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', area);

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (_, i) => x(i + 1))
      .attr('cy', d => y(d.close))
      .attr('r', 5)
      .attr('fill', color)
      .style('cursor', 'pointer')
      .on('mouseenter', function(_, d) {
        const i = data.indexOf(d);
        setTooltip({
          x: x(i + 1) + margin.left,
          y: y(d.close) + margin.top,
          value: d.close,
          date: d.date,
          visible: true
        });
      })
      .on('mouseleave', function() {
        setTooltip(t => ({ ...t, visible: false }));
      });
  }, [data, isDark]);

  return (
    <div className="w-full overflow-x-auto relative" style={{ minHeight: 260 }}>
      <div ref={ref} />
      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y - 30,
            background: isDark ? '#222' : '#fff',
            color: isDark ? '#fff' : '#222',
            border: isDark ? '1px solid #444' : '1px solid #ddd',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 13,
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}
        >
          <div><b>{tooltip.value.toFixed(2)} $</b></div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>{new Date(tooltip.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>
      )}
    </div>
  );
}

function CombinedChart({ data, isDark }: { data: any[], isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = React.useState<{
    x: number;
    y: number;
    value: number;
    date: string;
    type: string;
    visible: boolean;
  }>({ x: 0, y: 0, value: 0, date: '', type: '', visible: false });

  useEffect(() => {
    if (!ref.current || !data.length) return;
    ref.current.innerHTML = '';

    const width = 600;
    const height = 250;
    const margin = { top: 10, right: 60, bottom: 30, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    let extendedData = data;
    if (data.length > 0) {
      const first = { ...data[0], date: 'start' };
      const last = { ...data[data.length - 1], date: 'end' };
      extendedData = [first, ...data, last];
    }

    const x = d3.scaleLinear()
      .domain([0, extendedData.length - 1])
      .range([0, chartWidth]);
    
    
    const priceExtent = d3.extent(extendedData, d => d.close) as [number, number];
    const volumeExtent = d3.extent(extendedData, d => d.volume) as [number, number];
    
    const yPrice = d3.scaleLinear()
      .domain(priceExtent)
      .nice()
      .range([chartHeight, 0]);
      
    const yVolume = d3.scaleLinear()
      .domain(volumeExtent)
      .nice()
      .range([chartHeight, 0]);

    
    const formatPrice = (value: d3.NumberValue) => {
      const numValue = typeof value === 'number' ? value : value.valueOf();
      if (numValue >= 1000) {
        return (numValue / 1000).toFixed(1) + 'k';
      }
      return numValue.toFixed(0);
    };

    
    const formatVolume = (value: d3.NumberValue) => {
      const numValue = typeof value === 'number' ? value : value.valueOf();
      if (numValue >= 1000) {
        return (numValue / 1000).toFixed(1) + 'k';
      }
      return numValue.toFixed(0);
    };

    const maxLabels = 6;
    const labelIndexes: number[] = [];
    if (data.length > 1) {
      for (let i = 0; i < maxLabels; i++) {
        labelIndexes.push(Math.round(i * (data.length - 1) / (maxLabels - 1)));
      }
    } else {
      labelIndexes.push(0);
    }
    
    const svg = d3.select(ref.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', isDark ? '#242424' : '#F8F8F8');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(
        d3.scalePoint()
          .domain(data.map((_, i) => i.toString()))
          .range([x(1), x(extendedData.length - 2)])
      ).tickFormat((_, i) => {
        if (labelIndexes.includes(i)) {
          const date = new Date(data[i]?.date);
          return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
        }
        return '';
      }))
      .selectAll('text')
      .attr('font-size', 10)
      .attr('fill', isDark ? '#aaa' : '#333');

    
    g.append('g')
      .call(d3.axisLeft(yPrice).tickFormat(formatPrice))
      .selectAll('text')
      .attr('font-size', 10)
      .attr('fill', '#22c55e');

    
    g.append('g')
      .attr('transform', `translate(${chartWidth},0)`)
      .call(d3.axisRight(yVolume).tickFormat(formatVolume))
      .selectAll('text')
      .attr('font-size', 10)
      .attr('fill', '#3b82f6');

    
    const priceArea = d3.area<any>()
      .x((_, i) => x(i))
      .y0(chartHeight)
      .y1(d => yPrice(d.close))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(extendedData)
      .attr('fill', '#22c55e')
      .attr('fill-opacity', 0.15)
      .attr('stroke', '#22c55e')
      .attr('stroke-width', 2)
      .attr('d', priceArea);

    
    const volumeArea = d3.area<any>()
      .x((_, i) => x(i))
      .y0(chartHeight)
      .y1(d => yVolume(d.volume))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(extendedData)
      .attr('fill', '#3b82f6')
      .attr('fill-opacity', 0.15)
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', volumeArea);

    
    g.selectAll('.price-circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'price-circle')
      .attr('cx', (_, i) => x(i + 1))
      .attr('cy', d => yPrice(d.close))
      .attr('r', 4)
      .attr('fill', '#22c55e')
      .style('cursor', 'pointer')
      .on('mouseenter', function(_, d) {
        const i = data.indexOf(d);
        setTooltip({
          x: x(i + 1) + margin.left,
          y: yPrice(d.close) + margin.top,
          value: d.close,
          date: d.date,
          type: 'Prix',
          visible: true
        });
      })
      .on('mouseleave', function() {
        setTooltip(t => ({ ...t, visible: false }));
      });

    
    g.selectAll('.volume-circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'volume-circle')
      .attr('cx', (_, i) => x(i + 1))
      .attr('cy', d => yVolume(d.volume))
      .attr('r', 4)
      .attr('fill', '#3b82f6')
      .style('cursor', 'pointer')
      .on('mouseenter', function(_, d) {
        const i = data.indexOf(d);
        setTooltip({
          x: x(i + 1) + margin.left,
          y: yVolume(d.volume) + margin.top,
          value: d.volume,
          date: d.date,
          type: 'Volume',
          visible: true
        });
      })
      .on('mouseleave', function() {
        setTooltip(t => ({ ...t, visible: false }));
      });

  }, [data, isDark]);

  return (
    <div className="w-full overflow-x-auto relative" style={{ minHeight: 260 }}>
      <div ref={ref} />
      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y - 30,
            background: isDark ? '#222' : '#fff',
            color: isDark ? '#fff' : '#222',
            border: isDark ? '1px solid #444' : '1px solid #ddd',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 13,
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}
        >
          <div><b>{tooltip.type}: {tooltip.type === 'Prix' ? `${tooltip.value.toFixed(2)} $` : tooltip.value.toFixed(0)}</b></div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>{new Date(tooltip.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>
      )}
      
      {/* eàih )gnoier hgoiejntoentbhehrtzpoetpbonert
      <div className="absolute top-2 right-2 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        </div>
      </div> */}
    </div>
  );
}

export function MarketStatsModal({ item, isOpen, onClose }: MarketStatsModalProps) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'prix' | 'ventes' | 'tout'>('prix');
  const selectedTimeframe = useMarketStore(state => state.selectedTimeframe);
  const setSelectedTimeframe = useMarketStore(state => state.setSelectedTimeframe);
  
  if (!isOpen) return null;
  
  const getFilteredData = () => {
    const now = new Date();
    let startDate = new Date();
    
    switch (selectedTimeframe) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        return item.priceHistory;
    }
    
    return item.priceHistory.filter(data => new Date(data.date) >= startDate);
  };
  
  const filteredData = getFilteredData();
  
  const timeframeOptions = [
    { value: '1h', label: '1H' },
    { value: '24h', label: '24H' },
    { value: '7d', label: '7J' },
    { value: '30d', label: '30J' },
    { value: 'all', label: 'Tout' },
  ] as const;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div 
        className={cn(
          "w-full max-w-3xl max-h-[90vh] rounded-xl overflow-hidden",
          isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9]"
        )}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded overflow-hidden flex items-center justify-center",
              isDark ? "bg-[#242424]" : "bg-[#F8F8F8]"
            )}>
              <img src={item.image} alt={item.name} className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h2 className={isDark ? "text-white text-lg font-bold" : "text-[#333333] text-lg font-bold"}>
                {item.name}
              </h2>
              <p className="text-[#F0B90B]">{item.price}$ / unité</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-full",
              isDark ? "hover:bg-[#2A2A2A]" : "hover:bg-gray-100"
            )}
          >
            <X size={20} className={isDark ? "text-gray-400" : "text-gray-500"} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex border-b mb-4">
            <button
              onClick={() => setActiveTab('prix')}
              className={cn(
                "py-2 px-4 font-medium",
                activeTab === 'prix'
                  ? isDark 
                    ? "text-[#F0B90B] border-b-2 border-[#F0B90B]"
                    : "text-[#F0B90B] border-b-2 border-[#F0B90B]"
                  : isDark
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
              )}
            >
              Prix
            </button>
            <button
              onClick={() => setActiveTab('ventes')}
              className={cn(
                "py-2 px-4 font-medium",
                activeTab === 'ventes'
                  ? isDark 
                    ? "text-[#F0B90B] border-b-2 border-[#F0B90B]"
                    : "text-[#F0B90B] border-b-2 border-[#F0B90B]"
                  : isDark
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
              )}
            >
              Ventes
            </button>
            <button
              onClick={() => setActiveTab('tout')}
              className={cn(
                "py-2 px-4 font-medium",
                activeTab === 'tout'
                  ? isDark 
                    ? "text-[#F0B90B] border-b-2 border-[#F0B90B]"
                    : "text-[#F0B90B] border-b-2 border-[#F0B90B]"
                  : isDark
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
              )}
            >
              Tout
            </button>
          </div>
          
          <div className="flex justify-end mb-4">
            <div className={cn(
              "inline-flex rounded-md shadow-sm",
              isDark ? "bg-[#242424]" : "bg-[#F8F8F8]"
            )}>
              {timeframeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedTimeframe(option.value)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium first:rounded-l-md last:rounded-r-md",
                    selectedTimeframe === option.value
                      ? "bg-[#F0B90B] text-white"
                      : isDark
                        ? "text-gray-300 hover:bg-[#2A2A2A]"
                        : "text-gray-700 hover:bg-gray-100",
                    "transition-colors"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className={cn(
            "p-4 rounded-lg",
            isDark ? "bg-[#242424]" : "bg-[#F8F8F8]"
          )}>
            {activeTab === 'prix' ? (
              <>
                <p className={cn(
                  "text-sm mb-4",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}>
                  Évolution du prix sur la période sélectionnée
                </p>
                <AreaChart data={filteredData} isDark={isDark} color="#22c55e" />
              </>
            ) : activeTab === 'ventes' ? (
              <>
                <p className={cn(
                  "text-sm mb-4",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}>
                  Volume des ventes sur la période sélectionnée
                </p>
                <AreaChart 
                  data={filteredData.map(d => ({ ...d, close: d.volume }))} 
                  isDark={isDark} 
                  color="#3b82f6" 
                />
              </>
            ) : (
              <>
                <p className={cn(
                  "text-sm mb-4",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}>
                  Évolution du prix et volume des ventes superposés
                </p>
                <CombinedChart data={filteredData} isDark={isDark} />
              </>
            )}
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className={cn(
              "p-3 rounded-lg",
              isDark ? "bg-[#242424]" : "bg-[#F8F8F8]"
            )}>
              <p className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>Prix le plus haut</p>
              <p className={cn(
                "text-lg font-bold",
                isDark ? "text-white" : "text-[#333333]"
              )}>
                {Math.max(...filteredData.map(d => d.high)).toFixed(2)}$
              </p>
            </div>
            <div className={cn(
              "p-3 rounded-lg",
              isDark ? "bg-[#242424]" : "bg-[#F8F8F8]"
            )}>
              <p className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>Prix le plus bas</p>
              <p className={cn(
                "text-lg font-bold",
                isDark ? "text-white" : "text-[#333333]"
              )}>
                {Math.min(...filteredData.map(d => d.low)).toFixed(2)}$
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 