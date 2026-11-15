import snapshot from "./catalog/people.json";
import type { Talent, TalentCredits } from "./web/personDetails";
export interface PersonSnapshot { person: Talent; credits: TalentCredits }
export const catalogPeople = snapshot.people as PersonSnapshot[];
export const peopleCatalogDate = snapshot.updatedAt;
export const personCatalogKey = (id: number) => `person-${id}`;
export const catalogPerson = (value: string | number) => catalogPeople.find(p =>
  typeof value === "number" ? p.person.id === value : personCatalogKey(p.person.id) === value);
export const personPages = Object.fromEntries(catalogPeople.map(({ person }) => [personCatalogKey(person.id), {
  path: `/people/${person.id}`, title: `${person.name}: Biography, Films & TV Credits | Flixie`,
  description: `Explore ${person.name}'s biography, photos and film and TV credits on Flixie. ${person.biography}`.slice(0,157).trim(), label: person.name,
}])) as Record<`person-${number}`, { path: string; title: string; description: string; label: string }>;
