import React, { useEffect, useState, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';

import api from '../../services/api';

import './styles.css';
import logo from '../../assets/logo.svg';

//sempre que cria estado para array ou object necessário informar o tipo que 
//será armazenado

interface Item {
  id: number;
  name: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}
const CreatePoint = () => {
  // state e set do state
  const [items, setItems] = useState<Array<Item>>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [selectedUf, setSelectedUf] = useState('0');
  const [cities, setCities] = useState<Array<string>>([]);
  const [selectedCity, setSelectedCity] = useState<string>('0');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);


  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    })
  }, [])
  
  // primeiro param o que vai exec.(function), segundo param qual variavel gerencia a execução(se vazio exec. 1x)
  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    })
  }, [])

  useEffect(() => {
    axios.get<Array<IBGEUFResponse>>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      const ufInitials = response.data.map(uf => uf.sigla)
      setUfs(ufInitials);
    })
  }, [])

  useEffect(() => {
    // carregar sempre que uma uf for selecionada
    if (selectedUf !== '0') {
      axios
        .get<Array<IBGECityResponse>>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
        .then(response => {
          const citiesNames = response.data.map(city => city.nome)
          setCities(citiesNames)
        })
    }
  }, [selectedUf])

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;
    setSelectedUf(uf);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    setSelectedCity(city);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>
      <form action="">
        <h1>Cadastro do <br /> ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
              />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          <Map center={[-23.5645821, -46.6309262]} zoom={15} onClick={handleMapClick} >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado(UF)</label>
              <select name="uf" value={selectedUf} id="uf" onChange={handleSelectUf}>
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => {
                  return (
                    <option value={uf} key={uf} >{uf}</option>
                  );
                })}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" onChange={handleSelectCity}>
                <option value="0">Selecione uma Cidade</option>
                {cities.map(city => {
                  return (
                    <option value={city} key={city} >{city}</option>
                  );
                })}
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Itens de Coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map(item => {
              return (
                <li key={item.id} >
                  <img src={item.image_url} alt={item.name} />
                  <span>{item.name}</span>
                </li>
              );
            })}

          </ul>
        </fieldset>
        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
}

export default CreatePoint;