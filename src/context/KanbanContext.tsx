"use client";
import React, { createContext, useContext, useMemo, useState } from "react";
import type { List, Ticket } from "@/components/widgets/Kanban/types";

export interface KanbanContextType {
  // moved to @/Providers/KanbanProvider
  tickets: Ticket[];
