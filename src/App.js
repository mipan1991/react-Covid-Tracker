import React, { useState, useEffect } from "react"; 
import { MenuItem, FormControl, Select, Card, CardContent} from "@material-ui/core";
import InfoBox from './InfoBox';
import Map from "./Map";
import './App.css';
import Table from "./Table";
import { sortData, prettyPrintStat} from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

function App() {
    const [countries, setCountries] = useState([]);
    const [country, setCountry] = useState('worldwide'); 
    const [countryInfo, setCountryInfo] = useState({});
    const [tableData, setTableData] = useState([]);
    const [mapCenterZoom, setMapCenterZoom] = useState({ center: [34.80746, -40.4796], zoom: 3,});
    const [mapCountries, setMapCountries] = useState([]); 
    const [casesType, setCasesType] = useState("cases"); 


    


    useEffect(() => {
      fetch("https://disease.sh/v3/covid-19/all")
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data);
      }); 
    }, []);


    useEffect(() => {
      //this function should be ASYNCHRONOUS beacuse we are gonna send a REQ to a SERVER, we will then WAIT for it, and do something
      //with the info
      const getCountriesData = async () => {
          await fetch ("https://disease.sh/v3/covid-19/countries")  //this will go and make the fetch fromt this link
          .then((response) => response.json()) //when it comes back with the response, we want to first get the entire response and just take the json from it 
          .then((data) => {
            const countries = data.map((country) => (
              {
                name: country.country,              //United States of AMerica, United Kingdom
                value: country.countryInfo.iso2     //USA, UK
              }));

              const sortedData = sortData(data);
              setTableData(sortedData);         //storing all the data from disease.sh in this variable 
              setCountries(countries);    //so we go ahead and We store countries that we mapped through into setCountries
              setMapCountries(data);
              
          }); 
      };
      getCountriesData();
    }, []);
    // console.log('Countries>>>>>', mapCountries);

    const onCountryChange = async (event) =>{
      const countryCode = event.target.value; 

      const url = countryCode === "worldwide" ? "https://disease.sh/v3/covid-19/all" 
        : `https://disease.sh/v3/covid-19/countries/${countryCode}?yesterday=true`;
        
        
      await fetch(url)
        .then(response => response.json())
        .then((data) => {
          setCountry(countryCode);
          setCountryInfo(data);
          
          countryCode === "worldwide" ? setMapCenterZoom({ center: [34.80746, -40.4796], zoom: 3 })
          : setMapCenterZoom({
              center: [data.countryInfo.lat, data.countryInfo.long],
              zoom: 4,
            });
        });
    };

   console.log('COUNTRY INFO>>>>>', countryInfo);
  //  console.log('mapCenter>>>>>', mapCenter);
  
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app_dropdown">
            <Select variant = "outlined" onChange={onCountryChange} value = {country}>
              
              <MenuItem value="worldwide">Worldwide</MenuItem>
              
              {countries.map(country => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}

              {/* 
              
              <MenuItem value="worldwide">Option 3</MenuItem>
              <MenuItem value="worldwide">Option 4</MenuItem> */}
            </Select>
          </FormControl>


        </div>
        
        <div className="app__stats">
          <InfoBox
            isRed
            active = {casesType === "cases"}
            onClick = {(e) => setCasesType('cases')}
            title = "Coronavirus cases" 
            cases = {prettyPrintStat (countryInfo.todayCases)} 
            total = {prettyPrintStat (countryInfo.cases)}
          />
          <InfoBox 
            active = {casesType === "recovered"}
            onClick = {(e) => setCasesType('recovered')}
            title = "Recovered cases"
            cases = {prettyPrintStat (countryInfo.todayRecovered)} 
            total = {prettyPrintStat (countryInfo.recovered)}
          />
          <InfoBox 
            isRed
            active = {casesType === "deaths"}
            onClick = {(e) => setCasesType('deaths')}
            title = "Deaths" 
            cases = {prettyPrintStat (countryInfo.todayDeaths)} 
            total = {prettyPrintStat (countryInfo.deaths)}
          />
        </div>

        {/* Map */}
        <Map casesType = {casesType}
        countries = {mapCountries} 
        center={mapCenterZoom.center}
        zoom={mapCenterZoom.zoom}
        />
      
      </div>

      <Card className="app__right">
        <CardContent>

        <h3>Live Cases by Country</h3>
        {/* Table */}
        <Table countries = {tableData}/>

        <h3 className = "app__graphTitle">Worldwide new {casesType}</h3>
        {/* Graph */}

        <LineGraph className = "app__graph" casesType = {casesType} />

        </CardContent>
        
      </Card>
    </div>

  );
}

export default App;
