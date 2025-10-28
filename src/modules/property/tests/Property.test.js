import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Property } from "../Property";
import { useFetch } from "../../../services/fetch/useFetch";

// Mock del hook useFetch
jest.mock("../../../services/fetch/useFetch");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Property Component", () => {
  beforeAll(() => {
    // Evita interferencias en jsdom
    window.scrollTo = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra un loader mientras se cargan los datos", () => {
    useFetch.mockReturnValue({ data: null, loading: true, error: null });

    render(
      <MemoryRouter>
        <Property />
      </MemoryRouter>
    );

    expect(screen.getByText(/cargando inmueble/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveClass("spinner");
  });

  it("muestra un mensaje de error si falla la carga", async () => {
    useFetch.mockReturnValue({
      data: null,
      loading: false,
      error: "Error al cargar los datos",
    });

    render(
      <MemoryRouter>
        <Property />
      </MemoryRouter>
    );

    // Preferimos findBy* (evita waitFor + getBy)
    const errorMessage = await screen.findByText(/error al cargar el inmueble|no existe/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("renderiza correctamente los datos de la propiedad y permite regresar", async () => {
    const mockProperty = {
      name: "Casa en la playa",
      address: "Calle Ficticia 123",
      price: 100000000,
      year: 2010,
      idProperty: "12345",
      codeInternal: "ABC123",
      image: { file: "image-base64" },
      owner: { name: "Juan Pérez", address: "Calle Real 456", birthday: "1980-01-01" },
      traces: [{ dateSale: "2025-10-10", name: "Venta", value: 20000000, tax: 1000000 }],
    };

    useFetch.mockReturnValue({ data: mockProperty, loading: false, error: null });

    render(
      <MemoryRouter>
        <Property />
      </MemoryRouter>
    );

    // Datos principales
    expect(await screen.findByText("Casa en la playa")).toBeInTheDocument();
    expect(await screen.findByText(/📍\s*Calle Ficticia 123/i)).toBeInTheDocument();

    // Precio (acepta , o . como separador de miles)
    expect(
      await screen.findByText((_, el) =>
        Boolean(el?.textContent?.match(/💰\s*\$?\s*100([.,]000){3}\s*COP/i))
      )
    ).toBeInTheDocument();

    expect(await screen.findByText(/id propiedad:\s*12345/i)).toBeInTheDocument();
    expect(await screen.findByText(/código interno:\s*abc123/i)).toBeInTheDocument();
    expect(await screen.findByText(/año construcción:\s*2010/i)).toBeInTheDocument();

    // Historial
    expect(await screen.findByText(/historial de transacciones/i)).toBeInTheDocument();
    expect(await screen.findByText(/fecha:\s*2025-10-10/i)).toBeInTheDocument();
    expect(
      await screen.findByText((_, el) =>
        Boolean(el?.textContent?.match(/valor:\s*\$?\s*20([.,]000){2}\s*COP/i))
      )
    ).toBeInTheDocument();

    // Imágenes
    expect(await screen.findByAltText("Casa en la playa")).toBeInTheDocument();
    expect(await screen.findByAltText("Juan Pérez")).toBeInTheDocument();

    // Botón de regresar (navegación)
    const back = await screen.findByText(/←\s*regresar/i);
    fireEvent.click(back);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
