import { useState } from "react";

export const useDateFilterUI = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const resetDates = () => {
    setStartDate("");
    setEndDate("");
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
    setStartDate,
    setEndDate,
    toggleFilter,
    resetDates,
    setQuickDateRange,
  };
};
