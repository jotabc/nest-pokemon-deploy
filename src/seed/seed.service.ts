import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter
  ) { }

  async executeSeed() {

    await this.pokemonModel.deleteMany({ });

    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    // primera forma de inserir multiples registros
    // const insertPromisesArray = [];

    // 2da forma recomendada de inserir multiples registros
    const pokemonToInsert: { name: string, no: number }[] = [];

    data.results.forEach( async ({ name, url }) => {
      const no: number = +url.split('/').at(-2)

      // const pokemon = await this.pokemonModel.create({ name, no });

      // primera forma de inserir multiples registros
      // insertPromisesArray.push(
      //   this.pokemonModel.create({ name, no })
      // );

      // 2da forma recomendada de inserir multiples registros
      pokemonToInsert.push({ name, no })
    });

    // primera forma de inserir multiples registros
    // await Promise.all( insertPromisesArray );

    // 2da forma recomendada de inserir multiples registros
    await this.pokemonModel.insertMany(pokemonToInsert);

    return 'Seed execute';
  }

}
