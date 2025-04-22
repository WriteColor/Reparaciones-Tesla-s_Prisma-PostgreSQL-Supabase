"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { motion } from "framer-motion"
import { CalendarIcon, Loader2, Plus, X, Save } from "lucide-react"
import { notify } from "@/components/ui/notification"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileUploader } from "@/components/ui/file-input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  handleIdentityChange,
  handlePhoneChange
} from "@/lib/format-utils"
import {
  getBrands,
  getEquipmentTypes,
  addBrand,
  addEquipmentType,
  saveOrder
} from "@/app/actions/orders"

const formSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es obligatorio"),
  idNumber: z.string()
    .min(1, "El número de identidad es obligatorio")
    .refine(val => val.replace(/-/g, "").length === 13, {
      message: "El número de identidad debe tener 13 dígitos"
    }),
  primaryPhone: z.string()
    .min(1, "El teléfono principal es obligatorio")
    .refine(val => val.replace(/-/g, "").length === 8, {
      message: "El número de teléfono debe tener 8 dígitos"
    }),
  secondaryPhone: z.string()
    .optional()
    .refine((val): boolean => val ? val.replace(/-/g, "").length === 8 : true, {
      message: "El número de teléfono debe tener 8 dígitos"
    }),
  model: z.string().min(1, "El modelo del equipo es obligatorio"),
  brand: z.string().min(1, "La marca del equipo es obligatoria"),
  type: z.string().min(1, "El tipo de equipo es obligatorio"),
  serialNumber: z.string().min(1, "El número de serie es obligatorio"),
  entryDate: z.date({
    required_error: "Es obligatorio definir la fecha de entrada",
  }),
  diagnosis: z.string().optional(),
  repair: z.string().optional(),
  images: z.array(z.instanceof(File)).optional().or(z.literal(undefined)),
})

type FormData = z.infer<typeof formSchema>

export function AddOrderForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showNewBrand, setShowNewBrand] = useState(false)
  const [showNewType, setShowNewType] = useState(false)
  const [newBrand, setNewBrand] = useState("")
  const [newType, setNewType] = useState("")
  const [brands, setBrands] = useState<{ id: number; NombreMarca: string }[]>([])
  const [types, setTypes] = useState<{ id: number; NombreTipo: string }[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      idNumber: "",
      primaryPhone: "",
      secondaryPhone: "",
      model: "",
      brand: "",
      type: "",
      serialNumber: "",
      entryDate: new Date(),
      diagnosis: "",
      repair: "",
    },
  })

  const loadInitialData = useCallback(async () => {
    try {
      const [brandsData, typesData] = await Promise.all([
        getBrands(),
        getEquipmentTypes()
      ])
      setBrands(
        brandsData
          .filter(brand => brand.NombreMarca !== null)
          .map(brand => ({
            id: brand.id,
            NombreMarca: brand.NombreMarca as string
          }))
      )
      setTypes(
        typesData
          .filter(type => type.NombreTipo !== null)
          .map(type => ({
            id: type.id,
            NombreTipo: type.NombreTipo as string
          }))
      )
    } catch (error) {
      console.error("Error al cargar datos:", error)
      notify("error", "Error al cargar datos", "No se pudieron cargar las marcas y tipos de equipo.")
    }
  }, [])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  const handleAddBrand = async () => {
    if (!newBrand.trim()) return
    try {
      await addBrand(newBrand.trim())
      const updatedBrands = await getBrands()
      setBrands(
        updatedBrands
          .filter(brand => brand.NombreMarca !== null)
          .map(brand => ({
            id: brand.id,
            NombreMarca: brand.NombreMarca as string
          }))
      )
      form.setValue("brand", newBrand.trim())
      setNewBrand("")
      setShowNewBrand(false)
      notify("success", "Marca añadida", `Se ha añadido la marca "${newBrand.trim()}" correctamente.`)
    } catch (error) {
      console.error("Error al añadir marca:", error)
      notify("error", "Error", "No se pudo añadir la marca. Inténtelo de nuevo.")
    }
  }

  const handleAddType = async () => {
    if (!newType.trim()) return
    try {
      await addEquipmentType(newType.trim())
      const updatedTypes = await getEquipmentTypes()
      setTypes(
        updatedTypes
          .filter(type => type.NombreTipo !== null)
          .map(type => ({
            id: type.id,
            NombreTipo: type.NombreTipo as string
          }))
      )
      form.setValue("type", newType.trim())
      setNewType("")
      setShowNewType(false)
      notify("success", "Tipo añadido", `Se ha añadido el tipo "${newType.trim()}" correctamente.`)
    } catch (error) {
      console.error("Error al añadir tipo:", error)
      notify("error", "Error", "No se pudo añadir el tipo de equipo. Inténtelo de nuevo.")
    }
  }

  const onSubmit = async (values: FormData) => {
    setIsLoading(true)
    try {
      const orderData = {
        NombreCliente: values.fullName,
        Identidad: values.idNumber.replace(/-/g, ""),
        TelefonoPrincipal: values.primaryPhone.replace(/-/g, ""),
        TelefonoSecundario: values.secondaryPhone ? values.secondaryPhone.replace(/-/g, "") : "",
        Modelo: values.model,
        Marca: values.brand,
        TipoEquipo: values.type,
        NumeroSerie: values.serialNumber,
        Diagnostico: values.diagnosis || "",
        Reparacion: values.repair || "",
        FechaEntrada: values.entryDate,
      }

      await saveOrder(orderData, values.images)
      notify("success", "Orden guardada correctamente", "La orden de trabajo ha sido guardada con éxito.")

      form.reset({
        fullName: "",
        idNumber: "",
        primaryPhone: "",
        secondaryPhone: "",
        model: "",
        brand: "",
        type: "",
        serialNumber: "",
        entryDate: new Date(),
        diagnosis: "",
        repair: "",
        images: undefined,
      })

      router.push("/dashboard/manage-orders")
    } catch (error) {
      console.error("Error al guardar la orden:", error)
      notify("error", "Error al guardar", "No se pudo guardar la orden de trabajo. Inténtelo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-lg font-medium mb-4">Información del Cliente</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese el nombre completo del cliente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI del Cliente</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese el número de identidad del cliente"
                          maxLength={15}
                          onChange={(e) => handleIdentityChange(e, field.onChange)}
                          value={field.value}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="primaryPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono Principal</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese el número de teléfono principal"
                          maxLength={9}
                          onChange={(e) => handlePhoneChange(e, field.onChange)}
                          value={field.value}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secondaryPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono Secundario (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese el número de teléfono secundario"
                          maxLength={9}
                          onChange={(e) => handlePhoneChange(e, field.onChange)}
                          value={field.value || ""}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-lg font-medium mb-4">Información del Equipo</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese el modelo del equipo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca del Equipo</FormLabel>
                      <div className="space-y-2">
                        {!showNewBrand ? (
                          <div className="flex gap-2">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione una marca" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {brands.map((brand) => (
                                  <SelectItem key={brand.id} value={brand.NombreMarca}>
                                    {brand.NombreMarca}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button type="button" variant="outline" size="icon" onClick={() => setShowNewBrand(true)}>
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Añadir Marca</TooltipContent>
                            </Tooltip>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex gap-2"
                          >
                            <Input
                              placeholder="Ingresar nueva marca"
                              value={newBrand}
                              onChange={(e) => setNewBrand(e.target.value)}
                            />
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button type="button" variant="default" size="icon" onClick={handleAddBrand}>
                                  <Save className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Guardar Marca Nueva</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button type="button" variant="outline" size="icon" onClick={() => setShowNewBrand(false)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Cancelar</TooltipContent>
                            </Tooltip>
                          </motion.div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Equipo</FormLabel>
                      <div className="space-y-2">
                        {!showNewType ? (
                          <div className="flex gap-2">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione el tipo de equipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {types.map((type) => (
                                  <SelectItem key={type.id} value={type.NombreTipo}>
                                    {type.NombreTipo}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button type="button" variant="outline" size="icon" onClick={() => setShowNewType(true)}>
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Añadir Tipo</TooltipContent>
                            </Tooltip>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex gap-2"
                          >
                            <Input
                              placeholder="Ingresar nuevo tipo"
                              value={newType}
                              onChange={(e) => setNewType(e.target.value)}
                            />
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button type="button" variant="default" size="icon" onClick={handleAddType}>
                                  <Save className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Guardar Tipo Nuevo</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button type="button" variant="outline" size="icon" onClick={() => setShowNewType(false)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Cancelar</TooltipContent>
                            </Tooltip>
                          </motion.div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Serie</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese el número de serie del equipo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="entryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Ingreso</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccione una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            locale={es}
                            weekStartsOn={1}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnóstico</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ingrese los detalles del diagnóstico"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="repair"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reparación</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ingrese los detalles de la reparación"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-lg font-medium mb-4">Imagenes</div>
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel>Evidencias | Estado del equipo</FormLabel> */}
                    <FormControl>
                      <FileUploader
                        onFilesChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                        showDeleteConfirmation={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isValid}
              className="w-full md:w-auto text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4 text-white" />
                  Guardar orden
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </TooltipProvider>
  )
}