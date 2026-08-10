import faqCache from "../../../content/dex/faq-cache.json";
import knowledgeCards from "../../../content/dex/knowledge-cards.json";
import sources from "../../../content/dex/sources.json";
import suggestedQuestions from "../../../content/dex/suggested-questions.json";
import type {
  DexFaq,
  DexKnowledgeCard,
  DexSource,
  DexSuggestedQuestion,
} from "./types";

export const dexSources = sources as DexSource[];
export const dexKnowledgeCards = knowledgeCards as DexKnowledgeCard[];
export const dexFaqCache = faqCache as DexFaq[];
export const dexSuggestedQuestions = suggestedQuestions as DexSuggestedQuestion[];

const sourceById = new Map(dexSources.map((source) => [source.id, source]));

export function resolveDexSources(sourceIds: string[]): DexSource[] {
  return sourceIds
    .map((id) => sourceById.get(id))
    .filter((source): source is DexSource => Boolean(source));
}
