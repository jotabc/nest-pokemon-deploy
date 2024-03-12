import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Pokemon } from './entities/pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Injectable()
export class PokemonService {

	private defaultLimit: number;

	constructor(
		@InjectModel( Pokemon.name )
		private readonly pokemonModel: Model<Pokemon>,

		private readonly configService: ConfigService

	) {
		 this.defaultLimit = configService.get<number>('defaultLimit'); 
	 }
	
	async create(createPokemonDto: CreatePokemonDto) {
		createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

		try {
			const pokemon = await this.pokemonModel.create( createPokemonDto );
			return pokemon;

		} catch( error ) {
			this.handleExceptions( error );
		}

	}

	async findAll( paginationDto: PaginationDto ) {

		const { limit = this.defaultLimit, offset = 0 } = paginationDto
		return await this.pokemonModel.find()
			.limit( limit )
			.skip( offset )
			.sort({
				no: 1 // 1 quiere decir forma ascendente
			})
			.select('-__v'); // quito de la respuesta el campo __v de mongo.
	}

	async findOne(term: string) {

		let pokemon: Pokemon;

		// si es un número.
		if ( !isNaN(+term) ) {
			pokemon = await this.pokemonModel.findOne({ no: term });
		}

		// MongoID
		if ( !pokemon && isValidObjectId( term ) ) {
			pokemon = await this.pokemonModel.findById( term );
		}

		if ( !pokemon ) {
			pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() });
		}

		// Name

		if ( !pokemon )
			throw new NotFoundException(`Pokemon with id, name or no "${ term }" not found`);
		
		return pokemon;


	}

	async update(term: string, updatePokemonDto: UpdatePokemonDto) {
		const pokemon = await this.findOne( term );
		if (updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

		try {
			await pokemon.updateOne( updatePokemonDto );
			return {
				...pokemon.toJSON(),
				...updatePokemonDto
			}

		} catch ( error ) {
			this.handleExceptions( error );
		}
	}

	async remove( id: string ) {
		// const pokemon = this.findOne( id );
		// await pokemon.deleteOne();
		// const result = await this.pokemonModel.findByIdAndDelete( id );

		// con esto nos evitamos doble consulta es decir evitamos buscar y eliminar
		const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
		if (deletedCount === 0)
			throw new BadRequestException(`Pokemon with id "${ id }" not found.`);

		return;
		
	}

	private handleExceptions( error: any ) {
		if (error.code === 11000) {
			throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify( error.keyValue ) }`);
		}
		throw new InternalServerErrorException(`Can't update Pokemon - Check server logs`);
	}
	
}
