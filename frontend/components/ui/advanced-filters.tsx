'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Filter, X, Search } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'

export interface FilterOption {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number'
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

export interface ActiveFilter {
  key: string
  label: string
  value: any
  displayValue: string
}

interface AdvancedFiltersProps {
  filters: FilterOption[]
  activeFilters: ActiveFilter[]
  onFiltersChange: (filters: ActiveFilter[]) => void
  onSearch?: (searchTerm: string) => void
  searchPlaceholder?: string
}

export function AdvancedFilters({
  filters,
  activeFilters,
  onFiltersChange,
  onSearch,
  searchPlaceholder = "Buscar..."
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [tempFilters, setTempFilters] = useState<{[key: string]: any}>({})
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const handleFilterChange = (key: string, value: any, label: string) => {
    const filter = filters.find(f => f.key === key)
    if (!filter) return

    let displayValue = value
    
    if (filter.type === 'select' && filter.options) {
      const option = filter.options.find(o => o.value === value)
      displayValue = option?.label || value
    } else if (filter.type === 'date') {
      displayValue = value ? format(new Date(value), 'dd/MM/yyyy', { locale: es }) : ''
    }

    if (!value || value === '') {
      // Remove filter
      const newFilters = activeFilters.filter(f => f.key !== key)
      onFiltersChange(newFilters)
    } else {
      // Add or update filter
      const newFilters = activeFilters.filter(f => f.key !== key)
      newFilters.push({
        key,
        label,
        value,
        displayValue: displayValue.toString()
      })
      onFiltersChange(newFilters)
    }
  }

  const handleDateRangeChange = (key: string, label: string) => {
    if (dateRange?.from && dateRange?.to) {
      const displayValue = `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
      
      const newFilters = activeFilters.filter(f => f.key !== key)
      newFilters.push({
        key,
        label,
        value: { from: dateRange.from, to: dateRange.to },
        displayValue
      })
      onFiltersChange(newFilters)
    }
  }

  const clearAllFilters = () => {
    onFiltersChange([])
    setTempFilters({})
    setDateRange(undefined)
    setSearchTerm('')
    if (onSearch) onSearch('')
  }

  const removeFilter = (key: string) => {
    const newFilters = activeFilters.filter(f => f.key !== key)
    onFiltersChange(newFilters)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (onSearch) onSearch(value)
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex gap-2">
        {onSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        )}
        
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="whitespace-nowrap"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtros Avanzados
          {activeFilters.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilters.length}
            </Badge>
          )}
        </Button>

        {activeFilters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
          >
            <X className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter.key} variant="secondary" className="gap-1">
              <span className="font-medium">{filter.label}:</span>
              <span>{filter.displayValue}</span>
              <button
                onClick={() => removeFilter(filter.key)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Filter Panel */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <Label htmlFor={filter.key}>{filter.label}</Label>
                  
                  {filter.type === 'text' && (
                    <Input
                      id={filter.key}
                      placeholder={filter.placeholder}
                      value={tempFilters[filter.key] || ''}
                      onChange={(e) => {
                        setTempFilters({ ...tempFilters, [filter.key]: e.target.value })
                        handleFilterChange(filter.key, e.target.value, filter.label)
                      }}
                    />
                  )}

                  {filter.type === 'number' && (
                    <Input
                      id={filter.key}
                      type="number"
                      placeholder={filter.placeholder}
                      value={tempFilters[filter.key] || ''}
                      onChange={(e) => {
                        setTempFilters({ ...tempFilters, [filter.key]: e.target.value })
                        handleFilterChange(filter.key, e.target.value, filter.label)
                      }}
                    />
                  )}

                  {filter.type === 'select' && filter.options && (
                    <Select
                      value={tempFilters[filter.key] || ''}
                      onValueChange={(value) => {
                        setTempFilters({ ...tempFilters, [filter.key]: value })
                        handleFilterChange(filter.key, value, filter.label)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={filter.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {filter.type === 'date' && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tempFilters[filter.key] 
                            ? format(new Date(tempFilters[filter.key]), 'dd/MM/yyyy', { locale: es })
                            : filter.placeholder || 'Seleccionar fecha'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={tempFilters[filter.key] ? new Date(tempFilters[filter.key]) : undefined}
                          onSelect={(date) => {
                            const dateValue = date ? date.toISOString().split('T')[0] : ''
                            setTempFilters({ ...tempFilters, [filter.key]: dateValue })
                            handleFilterChange(filter.key, dateValue, filter.label)
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}

                  {filter.type === 'dateRange' && (
                    <div className="space-y-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from && dateRange?.to
                              ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                              : filter.placeholder || 'Seleccionar rango'
                            }
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={(range) => {
                              setDateRange(range)
                              if (range?.from && range?.to) {
                                handleDateRangeChange(filter.key, filter.label)
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cerrar
              </Button>
              <Button
                variant="outline"
                onClick={clearAllFilters}
              >
                Limpiar Todo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}