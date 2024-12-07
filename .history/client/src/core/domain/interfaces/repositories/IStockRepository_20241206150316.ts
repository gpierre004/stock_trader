import { Stock } from '../../entities/Stock';

export interface Company {
  ticker: string;
  name: string;
  sector?: string;
  industry?: string;
  active?: boolean;
}

