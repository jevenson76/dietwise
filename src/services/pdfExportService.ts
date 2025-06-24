import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { FoodItem, UserProfile, WeightEntry } from '@appTypes';

interface ExportOptions {
  includeWeightHistory?: boolean;
  includeMacroBreakdown?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export const exportFoodLogToPDF = (
  foodLog: FoodItem[],
  userProfile: UserProfile,
  weightLog?: WeightEntry[],
  options: ExportOptions = {}
) => {
  const doc = new jsPDF();

  // Add header
  doc.setFontSize(24);
  doc.setTextColor(20, 184, 166); // Teal color
  doc.text('DietWise Nutrition Report', 14, 20);

  // Add user info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Name: ${userProfile.name || 'N/A'}`, 14, 35);
  doc.text(`Generated: ${format(new Date(), 'PPP')}`, 14, 42);

  if (options.dateRange) {
    doc.text(`Period: ${format(options.dateRange.start, 'PP')} - ${format(options.dateRange.end, 'PP')}`, 14, 49);
  }

  let yPosition = 60;

  // Filter food log based on date range if provided
  let filteredFoodLog = foodLog;
  if (options.dateRange) {
    filteredFoodLog = foodLog.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= options.dateRange!.start && itemDate <= options.dateRange!.end;
    });
  }

  // Group food items by date
  const groupedByDate = filteredFoodLog.reduce((acc, item) => {
    const date = format(new Date(item.timestamp), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, FoodItem[]>);

  // Daily Summary
  doc.setFontSize(16);
  doc.setTextColor(20, 184, 166);
  doc.text('Daily Summary', 14, yPosition);
  yPosition += 10;

  const dailySummaryData = Object.entries(groupedByDate).map(([date, items]) => {
    const totalCalories = items.reduce((sum, item) => sum + (item.calories || 0), 0);
    const totalProtein = items.reduce((sum, item) => sum + (item.protein || 0), 0);
    const totalCarbs = items.reduce((sum, item) => sum + (item.carbs || 0), 0);
    const totalFat = items.reduce((sum, item) => sum + (item.fat || 0), 0);

    return [
      format(new Date(date), 'PP'),
      totalCalories.toFixed(0),
      totalProtein.toFixed(1) + 'g',
      totalCarbs.toFixed(1) + 'g',
      totalFat.toFixed(1) + 'g'
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Date', 'Calories', 'Protein', 'Carbs', 'Fat']],
    body: dailySummaryData,
    theme: 'grid',
    headStyles: { fillColor: [20, 184, 166] },
    margin: { left: 14 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 20;

  // Detailed Food Log
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(20, 184, 166);
  doc.text('Detailed Food Log', 14, yPosition);
  yPosition += 10;

  Object.entries(groupedByDate).forEach(([date, items]) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(format(new Date(date), 'PPPP'), 14, yPosition);
    yPosition += 8;

    const foodData = items.map(item => [
      item.name || 'Unknown',
      '-',
      (item.calories || 0).toFixed(0),
      (item.protein || 0).toFixed(1) + 'g',
      (item.carbs || 0).toFixed(1) + 'g',
      (item.fat || 0).toFixed(1) + 'g'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Food', 'Brand', 'Cal', 'Protein', 'Carbs', 'Fat']],
      body: foodData,
      theme: 'striped',
      headStyles: { fillColor: [94, 234, 212] }, // Light teal
      margin: { left: 14 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  });

  // Weight History (if included and available)
  if (options.includeWeightHistory && weightLog && weightLog.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setTextColor(20, 184, 166);
    doc.text('Weight History', 14, yPosition);
    yPosition += 10;

    const weightData = weightLog
      .filter(entry => {
        if (!options.dateRange) return true;
        const entryDate = new Date(entry.date);
        return entryDate >= options.dateRange.start && entryDate <= options.dateRange.end;
      })
      .map(entry => [
        format(new Date(entry.date), 'PP'),
        entry.weight.toFixed(1) + ' lbs'
      ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Weight']],
      body: weightData,
      theme: 'grid',
      headStyles: { fillColor: [20, 184, 166] },
      margin: { left: 14 }
    });
  }

  // Macro Breakdown (if included)
  if (options.includeMacroBreakdown) {
    const totalCalories = filteredFoodLog.reduce((sum, item) => sum + (item.calories || 0), 0);
    const totalProtein = filteredFoodLog.reduce((sum, item) => sum + (item.protein || 0), 0);
    const totalCarbs = filteredFoodLog.reduce((sum, item) => sum + (item.carbs || 0), 0);
    const totalFat = filteredFoodLog.reduce((sum, item) => sum + (item.fat || 0), 0);

    const proteinCalories = totalProtein * 4;
    const carbCalories = totalCarbs * 4;
    const fatCalories = totalFat * 9;

    if ((doc as any).lastAutoTable) {
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setTextColor(20, 184, 166);
    doc.text('Macro Breakdown', 14, yPosition);
    yPosition += 10;

    const macroData = [
      ['Total Calories', totalCalories.toFixed(0)],
      ['Protein', `${totalProtein.toFixed(1)}g (${((proteinCalories / totalCalories) * 100).toFixed(1)}%)`],
      ['Carbohydrates', `${totalCarbs.toFixed(1)}g (${((carbCalories / totalCalories) * 100).toFixed(1)}%)`],
      ['Fat', `${totalFat.toFixed(1)}g (${((fatCalories / totalCalories) * 100).toFixed(1)}%)`]
    ];

    autoTable(doc, {
      startY: yPosition,
      body: macroData,
      theme: 'plain',
      margin: { left: 14 }
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} - Generated by DietWise Premium`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
};