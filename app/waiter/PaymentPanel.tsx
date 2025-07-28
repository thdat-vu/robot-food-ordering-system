import * as React from "react";
import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TableBarIcon from "@mui/icons-material/TableBar";

interface Dish {
  id: number;
  name: string;
  type: string;
  selected: boolean;
  served?: boolean;
}

const TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function PaymentPanel({ dishes }: { dishes: Dish[] }) {
  const [open, setOpen] = React.useState(true);
  const [selectedTable, setSelectedTable] = React.useState<number | null>(null);

  const handleClick = () => {
    setOpen(!open);
  };

  const servedDishes = dishes.filter((d) => d.served);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-4">
      <div className="w-full max-w-lg">
        {selectedTable === null ? (
          <List
            sx={{
              width: "100%",
              bgcolor: "background.paper",
              borderRadius: 16,
              boxShadow: 6,
              p: 2,
            }}
            component="nav"
            aria-labelledby="table-list-subheader"
            subheader={
              <ListSubheader
                component="div"
                id="table-list-subheader"
                sx={{
                  fontSize: 22,
                  fontWeight: "bold",
                  color: "#059669",
                  bgcolor: "transparent",
                  mb: 2,
                }}
              >
                <TableBarIcon
                  sx={{ mr: 1, verticalAlign: "middle", color: "#059669" }}
                />
                Chọn bàn để thanh toán
              </ListSubheader>
            }
          >
            {TABLES.map((table) => (
              <ListItemButton
                key={table}
                onClick={() => setSelectedTable(table)}
                sx={{
                  mb: 1,
                  borderRadius: 8,
                  boxShadow: 1,
                  "&:hover": { bgcolor: "#d1fae5" },
                }}
              >
                <ListItemIcon>
                  <TableBarIcon sx={{ color: "#059669" }} />
                </ListItemIcon>
                <ListItemText
                  primary={`Bàn ${table}`}
                  primaryTypographyProps={{ fontWeight: "bold", fontSize: 18 }}
                />
              </ListItemButton>
            ))}
          </List>
        ) : (
          <List
            sx={{
              width: "100%",
              bgcolor: "background.paper",
              borderRadius: 16,
              boxShadow: 6,
              p: 2,
            }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
              <ListSubheader
                component="div"
                id="nested-list-subheader"
                sx={{
                  fontSize: 22,
                  fontWeight: "bold",
                  color: "#059669",
                  bgcolor: "transparent",
                  mb: 2,
                }}
              >
                <ReceiptLongIcon
                  sx={{ mr: 1, verticalAlign: "middle", color: "#059669" }}
                />
                Thanh toán - Bàn {selectedTable}
              </ListSubheader>
            }
          >
            <ListItemButton
              onClick={handleClick}
              sx={{
                borderRadius: 8,
                mb: 1,
                boxShadow: 1,
                "&:hover": { bgcolor: "#d1fae5" },
              }}
            >
              <ListItemIcon>
                <LocalCafeIcon sx={{ color: "#059669" }} />
              </ListItemIcon>
              <ListItemText
                primary="Các món đã phục vụ"
                primaryTypographyProps={{ fontWeight: "bold", fontSize: 18 }}
              />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {servedDishes.length === 0 ? (
                  <ListItemButton sx={{ pl: 4 }}>
                    <ListItemText
                      primary="Chưa có món nào được phục vụ."
                      sx={{ color: "text.secondary", fontStyle: "italic" }}
                    />
                  </ListItemButton>
                ) : (
                  servedDishes.map((d) => (
                    <ListItemButton
                      key={d.id}
                      sx={{ pl: 4, borderRadius: 8, mb: 1 }}
                    >
                      <ListItemText
                        primary={d.name}
                        primaryTypographyProps={{
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      />
                      <ListItemIcon>
                        <AttachMoneyIcon sx={{ color: "#059669" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="30.000đ"
                        sx={{
                          textAlign: "right",
                          color: "#059669",
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      />
                    </ListItemButton>
                  ))
                )}
              </List>
            </Collapse>
            <ListItemButton
              sx={{ borderRadius: 8, mt: 2, boxShadow: 1, bgcolor: "#d1fae5" }}
            >
              <ListItemIcon>
                <AttachMoneyIcon sx={{ color: "#059669" }} />
              </ListItemIcon>
              <ListItemText
                primary="Tổng"
                secondary={
                  servedDishes
                    .reduce((sum) => sum + 30000, 0)
                    .toLocaleString("vi-VN") + "đ"
                }
                primaryTypographyProps={{ fontWeight: "bold", fontSize: 18 }}
                secondaryTypographyProps={{
                  fontWeight: "bold",
                  color: "#059669",
                  fontSize: 18,
                }}
              />
            </ListItemButton>
          </List>
        )}
      </div>
    </div>
  );
}
