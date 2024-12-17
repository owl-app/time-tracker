import { DateTime, Duration } from 'luxon';
import { Response } from 'express';
import { format } from '@fast-csv/format';

import { Injectable } from '@nestjs/common';

import { Paginated } from '@owl-app/lib-api-core/pagination/pagination';
import { TimeResponse } from '../../../dto';

export type TimeCsvRow = {
  description: string;
  project: string;
  tags: string;
  date: string;
  duration: string;
  deurationDecimal: string;
};

@Injectable()
export class CsvGenerator {
  async generate(data: Paginated<TimeResponse>, response: Response): Promise<void> {
    response.setHeader('Content-Type', 'text/csv');
    response.setHeader('Content-Disposition', 'attachment; filename=data.csv');

    const csvData = data?.items?.map((item) => {
      const startDate = DateTime.fromJSDate(new Date(item?.timeIntervalStart));
      const endDate = DateTime.fromJSDate(new Date(item?.timeIntervalEnd));
      const duration = endDate.diff(startDate, ['hours', 'minutes', 'seconds']);

      return {
        description: item.description,
        project: item.project.name,
        tags: item.tags.map((tag) => tag.name).join(', '),
        date: endDate.toFormat('dd-MM-yyyy'),
        duration: duration.toFormat('hh:mm:ss'),
        deurationDecimal: this.durationToDecimal(duration),
      };
    });

    const csvStream = format<TimeCsvRow, TimeCsvRow>({
      headers: ['Opis', 'Projekt', 'Tagi', 'Data', 'Czas w godzinach (hh:mm:ss)', 'Czas w liczbie'],
    }).transform((row: TimeCsvRow) => ({
      'Opis': row.description,
      'Projekt': row.project,
      'Tagi': row.tags,
      'Data': row.date,
      'Czas w godzinach (hh:mm:ss)': row.duration,
      'Czas w liczbie': row.deurationDecimal,
    }));

    csvStream.pipe(response);

    csvData.forEach((row) => csvStream.write(row));

    csvStream.end();
  }

  private durationToDecimal(duration: Duration): string {
    const [hours, minutes, seconds] = duration.toFormat('hh:mm:ss').split(':').map(Number);
    const totalHours = hours + minutes / 60 + seconds / 3600;

    return totalHours.toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
