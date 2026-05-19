export declare enum Nivel {
    C1 = "C1",
    C2 = "C2",
    C3 = "C3",
    B1 = "B1"
}
export declare enum TipoParticipante {
    EMPLEADO = "EMPLEADO",
    INVITADO = "INVITADO"
}
export declare class RegistroParticipanteDto {
    nombre_completo: string;
    telefon: string;
    nivel?: Nivel;
    evento_id: string;
    tipo?: TipoParticipante;
    se_unio?: boolean;
    recompensa?: string;
}
