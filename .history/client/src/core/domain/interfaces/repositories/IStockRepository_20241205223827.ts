// src/core/domain/interfaces/repositories/IStockRepository.ts
import { Stock } from '../../entities/Stock';

export interface IStockRepository {
getStockPrices(ticker: string, startDate: Date, endDate: Date): Promise<Stock[]>;
getCompanies(): Promise<string[]>;
}