"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Insertar marcas
                return [4 /*yield*/, prisma.marcas.createMany({
                        data: [
                            { id: 1, NombreMarca: "ADATA" },
                            { id: 2, NombreMarca: "Acer" },
                            { id: 3, NombreMarca: "AMD" },
                            { id: 4, NombreMarca: "Apple" },
                            { id: 5, NombreMarca: "Asus" },
                            { id: 6, NombreMarca: "Beats" },
                            { id: 7, NombreMarca: "Bose" },
                            { id: 8, NombreMarca: "Brother" },
                            { id: 9, NombreMarca: "Canon" },
                            { id: 10, NombreMarca: "Corsair" },
                            { id: 11, NombreMarca: "DJI" },
                            { id: 12, NombreMarca: "Dell" },
                            { id: 13, NombreMarca: "Epson" },
                            { id: 14, NombreMarca: "Fitbit" },
                            { id: 15, NombreMarca: "Fujifilm" },
                            { id: 16, NombreMarca: "Garmin" },
                            { id: 17, NombreMarca: "Gigabyte" },
                            { id: 18, NombreMarca: "HP" },
                            { id: 19, NombreMarca: "Huawei" },
                            { id: 20, NombreMarca: "Intel" },
                            { id: 21, NombreMarca: "JBL" },
                            { id: 22, NombreMarca: "Kingston" },
                            { id: 23, NombreMarca: "LG" },
                            { id: 24, NombreMarca: "Lenovo" },
                            { id: 25, NombreMarca: "Logitech" },
                            { id: 26, NombreMarca: "Microsoft" },
                            { id: 27, NombreMarca: "Motorola" },
                            { id: 28, NombreMarca: "MSI" },
                            { id: 29, NombreMarca: "Nikon" },
                            { id: 30, NombreMarca: "Nokia" },
                            { id: 31, NombreMarca: "NVIDIA" },
                            { id: 32, NombreMarca: "OnePlus" },
                            { id: 33, NombreMarca: "Olympus" },
                            { id: 34, NombreMarca: "Oppo" },
                            { id: 35, NombreMarca: "Panasonic" },
                            { id: 36, NombreMarca: "Philips" },
                            { id: 37, NombreMarca: "Razer" },
                            { id: 38, NombreMarca: "Realme" },
                            { id: 39, NombreMarca: "Samsung" },
                            { id: 40, NombreMarca: "SanDisk" },
                            { id: 41, NombreMarca: "Seagate" },
                            { id: 42, NombreMarca: "Sennheiser" },
                            { id: 43, NombreMarca: "Sony" },
                            { id: 44, NombreMarca: "TP-Link" },
                            { id: 45, NombreMarca: "Toshiba" },
                            { id: 46, NombreMarca: "Ubiquiti" },
                            { id: 47, NombreMarca: "Vivo" },
                            { id: 48, NombreMarca: "Western Digital" },
                            { id: 49, NombreMarca: "Xiaomi" },
                            { id: 50, NombreMarca: "Marvo" }
                        ],
                        skipDuplicates: true
                    })
                    // Insertar tipos de equipo
                ];
                case 1:
                    // Insertar marcas
                    _a.sent();
                    // Insertar tipos de equipo
                    return [4 /*yield*/, prisma.tiposdeequipo.createMany({
                            data: [
                                { id: 1, NombreTipo: "Adaptador Wi-Fi" },
                                { id: 2, NombreTipo: "Altavoces" },
                                { id: 3, NombreTipo: "Auriculares" },
                                { id: 4, NombreTipo: "Cámara digital" },
                                { id: 5, NombreTipo: "Consola de videojuegos" },
                                { id: 6, NombreTipo: "Control remoto" },
                                { id: 7, NombreTipo: "Desktop" },
                                { id: 8, NombreTipo: "Disco duro externo" },
                                { id: 9, NombreTipo: "Drone" },
                                { id: 10, NombreTipo: "Escáner" },
                                { id: 11, NombreTipo: "Impresora" },
                                { id: 12, NombreTipo: "Laptop" },
                                { id: 13, NombreTipo: "Memoria USB" },
                                { id: 14, NombreTipo: "Micrófono" },
                                { id: 15, NombreTipo: "Monitor" },
                                { id: 16, NombreTipo: "Mouse" },
                                { id: 17, NombreTipo: "Proyector" },
                                { id: 18, NombreTipo: "Reproductor Blu-ray" },
                                { id: 19, NombreTipo: "Reproductor multimedia" },
                                { id: 20, NombreTipo: "Router" },
                                { id: 21, NombreTipo: "SSD" },
                                { id: 22, NombreTipo: "Sistema de sonido" },
                                { id: 23, NombreTipo: "Smartphone" },
                                { id: 24, NombreTipo: "Smartwatch" },
                                { id: 25, NombreTipo: "Tablet" },
                                { id: 26, NombreTipo: "Tarjeta gráfica" },
                                { id: 27, NombreTipo: "Teclado" },
                                { id: 28, NombreTipo: "Televisión" },
                                { id: 29, NombreTipo: "UPS" },
                                { id: 30, NombreTipo: "Videocámara" },
                            ],
                            skipDuplicates: true
                        })
                        // Insertar usuario de prueba
                    ];
                case 2:
                    // Insertar tipos de equipo
                    _a.sent();
                    // Insertar usuario de prueba
                    return [4 /*yield*/, prisma.users.create({
                            data: {
                                id: 1,
                                username: "test",
                                password: "test",
                                created_at: new Date("2024-10-28T07:25:33Z"),
                                updated_at: new Date("2025-04-04T01:19:43Z")
                            }
                        })];
                case 3:
                    // Insertar usuario de prueba
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .then(function () {
    console.log("Datos insertados correctamente.");
})
    .catch(function (e) {
    console.error("Error en el seed:", e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
