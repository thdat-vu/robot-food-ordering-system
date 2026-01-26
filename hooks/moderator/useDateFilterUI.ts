import { useState } from "react";

export const useDateFilterUI = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const today = new Date().toLocaleDateString("sv-SE");

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const handleSetStartDate = (date: string) => {
    const finalDate = date > today ? today : date;
    setStartDate(finalDate);
    if (endDate && finalDate > endDate) {
      setEndDate(finalDate);
    }
  };

  const handleSetEndDate = (date: string) => {
    const finalDate = date > today ? today : date;
    setEndDate(finalDate);
    if (startDate && finalDate < startDate) {
      setStartDate(finalDate);
    }
  };

  const resetDates = () => {
    setStartDate(today);
    setEndDate(today);
  };

  const setQuickDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();

    if (days === 0) {
      const today = end.toISOString().split("T")[0];
      setStartDate(today);
      setEndDate(today);
    } else {
      start.setDate(end.getDate() - days);
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(end.toISOString().split("T")[0]);
    }
  };

  return {
    isFilterOpen,
    startDate,
    endDate,
    setStartDate: handleSetStartDate,
    setEndDate: handleSetEndDate,
    toggleFilter,
    resetDates,
    setQuickDateRange,
  };
};
