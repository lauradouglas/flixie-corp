import { createContext } from "react";
import type { PersonSnapshot } from "../peopleCatalog";
export const InitialPerson = createContext<PersonSnapshot | undefined>(undefined);
