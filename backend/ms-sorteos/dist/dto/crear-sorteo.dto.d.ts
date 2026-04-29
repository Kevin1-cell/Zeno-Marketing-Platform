export declare enum NivelFilter {
    C1 = "C1",
    C2 = "C2",
    C3 = "C3",
    TODOS = "TODOS"
}
export declare enum ModoPremio {
    PRE_CARGA = "PRE_CARGA",
    MANUAL = "MANUAL"
}
export declare class CrearSorteoDto {
    evento_id: string;
    nombre: string;
    nivel_filtro?: NivelFilter;
    modo_premios?: ModoPremio;
}
