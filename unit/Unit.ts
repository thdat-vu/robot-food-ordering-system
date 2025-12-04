export const downloadPublicFile = (filePath: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = filePath;             // ví dụ: "/files/sample.pdf"
    link.download = fileName;         // ví dụ: "tai-ve.pdf"
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
